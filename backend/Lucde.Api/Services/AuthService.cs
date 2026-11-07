using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Lucde.Api.Data;
using Lucde.Api.Dtos;
using Lucde.Api.Middleware;
using Lucde.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Lucde.Api.Services;

public sealed class AuthService(
	AppDbContext database,
	UserManager<AppUser> users,
	SignInManager<AppUser> signInManager,
	IConfiguration configuration,
	IEmailSender emailSender,
	ILogger<AuthService> logger) : IAuthService
{
	private static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(30);
	public const string RefreshCookieName = "lucde_refresh";
	private sealed record IssuedRefreshToken(RefreshToken Entity, string Plaintext);

	public async Task<RegistrationResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken)
	{
		var email = request.Email.Trim();
		var user = new AppUser
		{
			Id = Guid.NewGuid(),
			UserName = email,
			Email = email,
			FullName = request.FullName.Trim(),
			CreatedAt = DateTimeOffset.UtcNow,
			UpdatedAt = DateTimeOffset.UtcNow
		};
		var result = await users.CreateAsync(user, request.Password);
		if (!result.Succeeded)
			throw IdentityValidationException(result.Errors);

		var roleResult = await users.AddToRoleAsync(user, AppRoles.Student);
		if (!roleResult.Succeeded)
			throw new InvalidOperationException("The default student role could not be assigned.");

		database.StudentProfiles.Add(new StudentProfile { Id = Guid.NewGuid(), UserId = user.Id, DisplayName = user.FullName });
		database.Notifications.Add(new Notification
		{
			Id = Guid.NewGuid(), UserId = user.Id, Type = "account",
			Title = "مرحبًا بك في أفق", Message = "تم إنشاء حسابك. أكّد بريدك الإلكتروني للبدء."
		});
		database.AuditLogs.Add(new AuditLog { Id = Guid.NewGuid(), UserId = user.Id, Action = "AccountRegistered", Subject = user.Id.ToString() });
		await database.SaveChangesAsync(cancellationToken);
		await SendConfirmationAsync(user, cancellationToken);

		return new RegistrationResponse(user.Id, "Account created. Follow the email instructions to verify it.");
	}

	public async Task<AuthSession> LoginAsync(LoginRequest request, string ipAddress, CancellationToken cancellationToken)
	{
		var user = await users.FindByEmailAsync(request.Email.Trim());
		if (user is null || !user.IsActive)
			throw Unauthorized();

		var signIn = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
		if (!signIn.Succeeded)
			throw Unauthorized();

		return await CreateSessionAsync(user, ipAddress, cancellationToken);
	}

	public async Task<AuthSession> RefreshAsync(string token, string ipAddress, CancellationToken cancellationToken)
	{
		await using var transaction = await database.Database.BeginTransactionAsync(
			System.Data.IsolationLevel.Serializable, cancellationToken);
		var hash = HashToken(token);
		var existing = await database.RefreshTokens.SingleOrDefaultAsync(item => item.TokenHash == hash, cancellationToken);
		if (existing is null)
			throw Unauthorized();

		var user = await users.FindByIdAsync(existing.UserId.ToString());
		if (existing.RevokedAt is not null)
		{
			await database.RefreshTokens
				.Where(item => item.UserId == existing.UserId && item.RevokedAt == null)
				.ExecuteUpdateAsync(update => update.SetProperty(item => item.RevokedAt, DateTimeOffset.UtcNow)
					.SetProperty(item => item.RevokedByIp, ipAddress), cancellationToken);
			await transaction.CommitAsync(cancellationToken);
			throw Unauthorized();
		}

		if (user is null || !user.IsActive || existing.ExpiresAt <= DateTimeOffset.UtcNow)
		{
			existing.RevokedAt = DateTimeOffset.UtcNow;
			existing.RevokedByIp = ipAddress;
			await database.SaveChangesAsync(cancellationToken);
			await transaction.CommitAsync(cancellationToken);
			throw Unauthorized();
		}

		var next = CreateRefreshToken(user.Id, ipAddress);
		existing.RevokedAt = DateTimeOffset.UtcNow;
		existing.RevokedByIp = ipAddress;
		existing.ReplacedByTokenHash = next.Entity.TokenHash;
		database.RefreshTokens.Add(next.Entity);
		await database.SaveChangesAsync(cancellationToken);
		await transaction.CommitAsync(cancellationToken);
		return await CreateSessionResponseAsync(user, next, cancellationToken);
	}

	public async Task RevokeAsync(string? token, string ipAddress, CancellationToken cancellationToken)
	{
		if (string.IsNullOrWhiteSpace(token))
			return;

		var hash = HashToken(token);
		var refreshToken = await database.RefreshTokens.SingleOrDefaultAsync(item => item.TokenHash == hash, cancellationToken);
		if (refreshToken is null || refreshToken.RevokedAt is not null)
			return;

		refreshToken.RevokedAt = DateTimeOffset.UtcNow;
		refreshToken.RevokedByIp = ipAddress;
		await database.SaveChangesAsync(cancellationToken);
	}

	public async Task ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken)
	{
		var user = await users.FindByIdAsync(request.UserId.ToString());
		if (user is null)
			throw new ApiException(StatusCodes.Status400BadRequest, "Invalid verification link", "The verification link is invalid or expired.");

		try
		{
			var token = Encoding.UTF8.GetString(Convert.FromBase64String(request.Token));
			var result = await users.ConfirmEmailAsync(user, token);
			if (result.Succeeded)
				return;
		}
		catch (FormatException)
		{
			logger.LogWarning("Malformed email confirmation token for user {UserId}", request.UserId);
		}

		throw new ApiException(StatusCodes.Status400BadRequest, "Invalid verification link", "The verification link is invalid or expired.");
	}

	public async Task ResendConfirmationAsync(ResendConfirmationRequest request, CancellationToken cancellationToken)
	{
		var user = await users.FindByEmailAsync(request.Email.Trim());
		if (user is not null && !user.EmailConfirmed)
			await SendConfirmationAsync(user, cancellationToken);
	}

	public async Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken)
	{
		var user = await users.FindByEmailAsync(request.Email.Trim());
		if (user is null || !user.IsActive || !user.EmailConfirmed)
			return;

		var token = await users.GeneratePasswordResetTokenAsync(user);
		var encodedToken = Convert.ToBase64String(Encoding.UTF8.GetBytes(token));
		var resetUrl = $"{GetFrontendUrl()}/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={Uri.EscapeDataString(encodedToken)}";
		await emailSender.SendAsync(user.Email!, "Reset your Lucde password",
			$"<p>Use this link to reset your password. It expires according to the Identity token provider settings.</p><p><a href=\"{resetUrl}\">Reset password</a></p>",
			cancellationToken);
	}

	public async Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken)
	{
		var user = await users.FindByEmailAsync(request.Email.Trim());
		if (user is null || !user.IsActive)
			throw InvalidResetToken();

		string token;
		try
		{
			token = Encoding.UTF8.GetString(Convert.FromBase64String(request.Token));
		}
		catch (FormatException)
		{
			throw InvalidResetToken();
		}

		var result = await users.ResetPasswordAsync(user, token, request.NewPassword);
		if (!result.Succeeded)
		{
			var errors = result.Errors.ToDictionary(error => error.Code, error => new[] { error.Description });
			throw new ApiException(StatusCodes.Status400BadRequest, "Password reset failed", "The password could not be reset.", errors);
		}

		await database.RefreshTokens
			.Where(item => item.UserId == user.Id && item.RevokedAt == null)
			.ExecuteUpdateAsync(update => update.SetProperty(item => item.RevokedAt, DateTimeOffset.UtcNow), cancellationToken);
		database.AuditLogs.Add(new AuditLog { Id = Guid.NewGuid(), UserId = user.Id, Action = "PasswordReset", Subject = user.Id.ToString() });
		await database.SaveChangesAsync(cancellationToken);
	}

	private async Task SendConfirmationAsync(AppUser user, CancellationToken cancellationToken)
	{
		var token = await users.GenerateEmailConfirmationTokenAsync(user);
		var encodedToken = Convert.ToBase64String(Encoding.UTF8.GetBytes(token));
		var confirmationUrl = $"{GetFrontendUrl()}/verify-email?userId={user.Id}&token={Uri.EscapeDataString(encodedToken)}";
		await emailSender.SendAsync(user.Email!, "Verify your Lucde account",
			$"<p>Please verify your email address to activate your account.</p><p><a href=\"{confirmationUrl}\">Verify email</a></p>",
			cancellationToken);
	}

	private async Task<AuthSession> CreateSessionAsync(AppUser user, string ipAddress, CancellationToken cancellationToken)
	{
		var refreshToken = CreateRefreshToken(user.Id, ipAddress);
		database.RefreshTokens.Add(refreshToken.Entity);
		database.AuditLogs.Add(new AuditLog { Id = Guid.NewGuid(), UserId = user.Id, Action = "Login", Subject = user.Id.ToString(), IpAddress = ipAddress });
		await database.SaveChangesAsync(cancellationToken);
		return await CreateSessionResponseAsync(user, refreshToken, cancellationToken);
	}

	private async Task<AuthSession> CreateSessionResponseAsync(AppUser user, IssuedRefreshToken refreshToken, CancellationToken cancellationToken)
	{
		var roles = await users.GetRolesAsync(user);
		var now = DateTimeOffset.UtcNow;
		var claims = new List<Claim>
		{
			new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
			new(ClaimTypes.NameIdentifier, user.Id.ToString()),
			new(ClaimTypes.Name, user.FullName),
			new(ClaimTypes.Email, user.Email!),
			new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
		};
		claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

		var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:SigningKey"]!));
		var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
		var issuer = configuration["Jwt:Issuer"] ?? "Lucde.Api";
		var audience = configuration["Jwt:Audience"] ?? "Lucde.Web";
		var accessTokenMinutes = configuration.GetValue("Jwt:AccessTokenMinutes", 15);
		var expiresAt = now.AddMinutes(accessTokenMinutes);
		var jwt = new JwtSecurityToken(issuer, audience, claims, now.UtcDateTime,
			expiresAt.UtcDateTime, credentials);
		var accessToken = new JwtSecurityTokenHandler().WriteToken(jwt);
		var userResponse = new UserResponse(user.Id, user.FullName, user.Email!, roles.ToArray());
		cancellationToken.ThrowIfCancellationRequested();
		return new AuthSession(new AuthResponse(userResponse, accessToken, expiresAt), refreshToken.Plaintext, refreshToken.Entity.ExpiresAt);
	}

	private IssuedRefreshToken CreateRefreshToken(Guid userId, string ipAddress)
	{
		var plainText = WebEncoders.Base64UrlEncode(RandomNumberGenerator.GetBytes(64));
		var entity = new RefreshToken
		{
			Id = Guid.NewGuid(),
			UserId = userId,
			TokenHash = HashToken(plainText),
			CreatedByIp = ipAddress,
			ExpiresAt = DateTimeOffset.UtcNow.Add(RefreshTokenLifetime)
		};
		return new IssuedRefreshToken(entity, plainText);
	}

	private string GetFrontendUrl() =>
		(configuration["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');

	private static string HashToken(string token) =>
		Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

	private static ApiException IdentityValidationException(IEnumerable<IdentityError> identityErrors)
	{
		var errors = identityErrors
			.GroupBy(error => error.Code.Contains("Password", StringComparison.OrdinalIgnoreCase) ? "password" : "account")
			.ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray());
		return new ApiException(StatusCodes.Status400BadRequest, "Registration failed", "Review the submitted account details.", errors);
	}

	private static ApiException Unauthorized() =>
		new(StatusCodes.Status401Unauthorized, "Unauthorized", "The credentials or refresh session are invalid.");

	private static ApiException InvalidResetToken() =>
		new(StatusCodes.Status400BadRequest, "Invalid reset link", "The password reset link is invalid or expired.");
}
