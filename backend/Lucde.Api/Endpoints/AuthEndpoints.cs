using Lucde.Api.Dtos;
using Lucde.Api.Middleware;
using Lucde.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Lucde.Api.Endpoints;

public static class AuthEndpoints
{
	public static void MapAuthEndpoints(this IEndpointRouteBuilder endpoints)
	{
		var group = endpoints.MapGroup("/api/auth")
			.WithTags("Authentication")
			.RequireRateLimiting("auth-sensitive");

		group.MapPost("/register", async Task<Accepted<RegistrationResponse>> (
			RegisterRequest request, IAuthService auth, CancellationToken cancellationToken) =>
			TypedResults.Accepted("/api/auth/confirm-email",
				await auth.RegisterAsync(request, cancellationToken)))
			.AllowAnonymous()
			.WithSummary("Register a student and send email verification instructions");

		group.MapPost("/login", async Task<Ok<AuthResponse>> (
			LoginRequest request, HttpContext context, IAuthService auth, CancellationToken cancellationToken) =>
		{
			var session = await auth.LoginAsync(request, GetIpAddress(context), cancellationToken);
			SetRefreshCookie(context, session);
			return TypedResults.Ok(session.Response);
		})
			.AllowAnonymous()
			.WithSummary("Sign in and issue a short-lived access token");

		group.MapPost("/refresh", async Task<Ok<AuthResponse>> (
			HttpContext context, IAuthService auth, CancellationToken cancellationToken) =>
		{
			var refreshToken = context.Request.Cookies[AuthService.RefreshCookieName];
			if (string.IsNullOrWhiteSpace(refreshToken))
				throw new ApiException(StatusCodes.Status401Unauthorized, "Unauthorized", "The refresh session is missing or expired.");

			try
			{
				var session = await auth.RefreshAsync(refreshToken, GetIpAddress(context), cancellationToken);
				SetRefreshCookie(context, session);
				return TypedResults.Ok(session.Response);
			}
			catch (ApiException exception) when (exception.StatusCode == StatusCodes.Status401Unauthorized)
			{
				ClearRefreshCookie(context);
				throw;
			}
		})
			.AllowAnonymous()
			.WithSummary("Rotate the refresh token and issue a new access token");

		group.MapPost("/logout", async Task<NoContent> (
			HttpContext context, IAuthService auth, CancellationToken cancellationToken) =>
		{
			await auth.RevokeAsync(context.Request.Cookies[AuthService.RefreshCookieName],
				GetIpAddress(context), cancellationToken);
			ClearRefreshCookie(context);
			return TypedResults.NoContent();
		})
			.AllowAnonymous()
			.WithSummary("Revoke the current refresh session");

		group.MapPost("/confirm-email", async Task<NoContent> (
			ConfirmEmailRequest request, IAuthService auth, CancellationToken cancellationToken) =>
		{
			await auth.ConfirmEmailAsync(request, cancellationToken);
			return TypedResults.NoContent();
		})
			.AllowAnonymous()
			.WithSummary("Confirm an email address");

		group.MapPost("/resend-confirmation", async Task<Ok<MessageResponse>> (
			ResendConfirmationRequest request, IAuthService auth, CancellationToken cancellationToken) =>
		{
			await auth.ResendConfirmationAsync(request, cancellationToken);
			return TypedResults.Ok(new MessageResponse("If the account needs verification, instructions will be sent."));
		})
			.AllowAnonymous()
			.WithSummary("Resend email verification instructions");

		group.MapPost("/forgot-password", async Task<Ok<MessageResponse>> (
			ForgotPasswordRequest request, IAuthService auth, CancellationToken cancellationToken) =>
		{
			await auth.ForgotPasswordAsync(request, cancellationToken);
			return TypedResults.Ok(new MessageResponse("If the account exists, password reset instructions will be sent."));
		})
			.AllowAnonymous()
			.WithSummary("Send password reset instructions");

		group.MapPost("/reset-password", async Task<NoContent> (
			ResetPasswordRequest request, IAuthService auth, CancellationToken cancellationToken) =>
		{
			await auth.ResetPasswordAsync(request, cancellationToken);
			return TypedResults.NoContent();
		})
			.AllowAnonymous()
			.WithSummary("Reset a password using a time-limited Identity token");
	}

	private static string GetIpAddress(HttpContext context) => context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

	private static void SetRefreshCookie(HttpContext context, AuthSession session)
	{
		context.Response.Cookies.Append(AuthService.RefreshCookieName, session.RefreshToken, new CookieOptions
		{
			HttpOnly = true,
			Secure = !context.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment() || context.Request.IsHttps,
			SameSite = SameSiteMode.Strict,
			Path = "/api/auth",
			Expires = session.RefreshExpiresAt,
			IsEssential = true
		});
	}

	private static void ClearRefreshCookie(HttpContext context) =>
		context.Response.Cookies.Delete(AuthService.RefreshCookieName, new CookieOptions
		{
			HttpOnly = true,
			Secure = !context.RequestServices.GetRequiredService<IHostEnvironment>().IsDevelopment() || context.Request.IsHttps,
			SameSite = SameSiteMode.Strict,
			Path = "/api/auth"
		});
}
