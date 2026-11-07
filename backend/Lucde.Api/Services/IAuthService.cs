using Lucde.Api.Dtos;

namespace Lucde.Api.Services;

public interface IAuthService
{
	Task<RegistrationResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
	Task<AuthSession> LoginAsync(LoginRequest request, string ipAddress, CancellationToken cancellationToken);
	Task<AuthSession> RefreshAsync(string token, string ipAddress, CancellationToken cancellationToken);
	Task RevokeAsync(string? token, string ipAddress, CancellationToken cancellationToken);
	Task ConfirmEmailAsync(ConfirmEmailRequest request, CancellationToken cancellationToken);
	Task ResendConfirmationAsync(ResendConfirmationRequest request, CancellationToken cancellationToken);
	Task ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken);
	Task ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken);
}

public sealed record AuthSession(AuthResponse Response, string RefreshToken, DateTimeOffset RefreshExpiresAt);
