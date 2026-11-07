using System.ComponentModel.DataAnnotations;

namespace Lucde.Api.Dtos;

/// <summary>Credentials and profile details used to register a student account.</summary>
public sealed record RegisterRequest
{
	[Required, StringLength(120, MinimumLength = 2)]
	public required string FullName { get; init; }

	[Required, EmailAddress, StringLength(256)]
	public required string Email { get; init; }

	[Required, StringLength(128, MinimumLength = 8)]
	public required string Password { get; init; }
}

/// <summary>Credentials used to sign in.</summary>
public sealed record LoginRequest
{
	[Required, EmailAddress, StringLength(256)]
	public required string Email { get; init; }

	[Required, StringLength(128)]
	public required string Password { get; init; }
}

/// <summary>Request to resend account verification instructions.</summary>
public sealed record ResendConfirmationRequest
{
	[Required, EmailAddress, StringLength(256)]
	public required string Email { get; init; }
}

/// <summary>Identity and token values used to verify an email address.</summary>
public sealed record ConfirmEmailRequest
{
	[Required]
	public required Guid UserId { get; init; }

	[Required, StringLength(4096)]
	public required string Token { get; init; }
}

/// <summary>Email address for a password recovery request.</summary>
public sealed record ForgotPasswordRequest
{
	[Required, EmailAddress, StringLength(256)]
	public required string Email { get; init; }
}

/// <summary>Identity token and replacement password for account recovery.</summary>
public sealed record ResetPasswordRequest
{
	[Required, EmailAddress, StringLength(256)]
	public required string Email { get; init; }

	[Required, StringLength(4096)]
	public required string Token { get; init; }

	[Required, StringLength(128, MinimumLength = 8)]
	public required string NewPassword { get; init; }
}

/// <summary>Public account details returned by authentication endpoints.</summary>
public sealed record UserResponse(
	Guid Id,
	string FullName,
	string Email,
	IReadOnlyList<string> Roles);

/// <summary>Access token and account details returned after sign-in or refresh.</summary>
public sealed record AuthResponse(
	UserResponse User,
	string AccessToken,
	DateTimeOffset ExpiresAt);

/// <summary>Confirmation that account registration was accepted.</summary>
public sealed record RegistrationResponse(Guid UserId, string Message);

/// <summary>Generic response that avoids disclosing account existence.</summary>
public sealed record MessageResponse(string Message);
