using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Lucde.Api.Data;
using Lucde.Api.Endpoints;
using Lucde.Api.Middleware;
using Lucde.Api.Models;
using Lucde.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Default")
	?? throw new InvalidOperationException("ConnectionStrings:Default must be configured.");
var signingKey = builder.Configuration["Jwt:SigningKey"]
	?? throw new InvalidOperationException("Configure Jwt:SigningKey with a secret of at least 32 bytes.");
if (Encoding.UTF8.GetByteCount(signingKey) < 32)
	throw new InvalidOperationException("Jwt:SigningKey must contain at least 32 bytes.");
if (!builder.Environment.IsDevelopment()
	&& (string.IsNullOrWhiteSpace(builder.Configuration["Email:Smtp:Host"])
		|| string.IsNullOrWhiteSpace(builder.Configuration["Email:SenderAddress"])
		|| string.IsNullOrWhiteSpace(builder.Configuration["Frontend:BaseUrl"])))
	throw new InvalidOperationException("Production requires SMTP, Email:SenderAddress, and Frontend:BaseUrl configuration.");

builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
builder.Services
	.AddIdentityCore<AppUser>(options =>
	{
		options.User.RequireUniqueEmail = true;
		options.SignIn.RequireConfirmedEmail = true;
		options.Password.RequiredLength = 8;
		options.Password.RequireDigit = true;
		options.Password.RequireUppercase = true;
		options.Password.RequireLowercase = true;
		options.Password.RequireNonAlphanumeric = false;
		options.Lockout.MaxFailedAccessAttempts = 5;
		options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
	})
	.AddRoles<IdentityRole<Guid>>()
	.AddEntityFrameworkStores<AppDbContext>()
	.AddSignInManager()
	.AddDefaultTokenProviders();

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "Lucde.Api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "Lucde.Web";
var accessTokenMinutes = builder.Configuration.GetValue("Jwt:AccessTokenMinutes", 15);
if (accessTokenMinutes is < 1 or > 60)
	throw new InvalidOperationException("Jwt:AccessTokenMinutes must be between 1 and 60.");
builder.Services
	.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
	.AddJwtBearer(options =>
	{
		options.TokenValidationParameters = new TokenValidationParameters
		{
			ValidateIssuer = true,
			ValidIssuer = jwtIssuer,
			ValidateAudience = true,
			ValidAudience = jwtAudience,
			ValidateIssuerSigningKey = true,
			IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
			ValidateLifetime = true,
			ClockSkew = TimeSpan.FromSeconds(30),
			NameClaimType = ClaimTypes.Name,
			RoleClaimType = ClaimTypes.Role
		};
		options.Events = new JwtBearerEvents
		{
			OnTokenValidated = async context =>
			{
				var principal = context.Principal;
				var idValue = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
				if (principal is null || !Guid.TryParse(idValue, out var userId))
				{
					context.Fail("Invalid account identifier.");
					return;
				}

				var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<AppUser>>();
				var user = await userManager.FindByIdAsync(userId.ToString());
				if (user is null || !user.IsActive)
				{
					context.Fail("Account is unavailable.");
					return;
				}

				var currentRoles = (await userManager.GetRolesAsync(user)).Order(StringComparer.Ordinal).ToArray();
				var tokenRoles = principal.FindAll(ClaimTypes.Role).Select(claim => claim.Value)
					.Order(StringComparer.Ordinal).ToArray();
				if (!currentRoles.SequenceEqual(tokenRoles, StringComparer.Ordinal))
					context.Fail("Account permissions have changed.");
			}
		};
	});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
if (allowedOrigins is null || allowedOrigins.Length == 0)
{
	if (!builder.Environment.IsDevelopment())
		throw new InvalidOperationException("Configure Cors:AllowedOrigins with the production frontend origin.");
	allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
}
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy =>
	policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

builder.Services.AddAuthorization();
builder.Services.AddValidation();
builder.Services.ConfigureHttpJsonOptions(options =>
	options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddRateLimiter(options =>
{
	options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
	options.AddPolicy("auth-sensitive", context =>
		RateLimitPartition.GetFixedWindowLimiter(
			context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
			_ => new FixedWindowRateLimiterOptions
			{
				PermitLimit = 10,
				Window = TimeSpan.FromMinutes(1),
				QueueLimit = 0,
				AutoReplenishment = true
			}));
});

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IEmailSender, EmailSender>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
if (!app.Environment.IsDevelopment())
{
	app.UseHsts();
	app.UseHttpsRedirection();
}
app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
	app.MapOpenApi();

app.MapGet("/health", () => TypedResults.Ok(new { status = "ok" }))
	.AllowAnonymous()
	.WithSummary("Check API availability");
app.MapAuthEndpoints();
app.MapAccountEndpoints();
app.MapAdminEndpoints();

await IdentityInitializer.InitializeAsync(app.Services, app.Configuration,
	app.Services.GetRequiredService<ILoggerFactory>().CreateLogger("IdentityInitializer"));

app.Run();

public partial class Program;
