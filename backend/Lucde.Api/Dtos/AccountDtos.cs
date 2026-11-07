using System.ComponentModel.DataAnnotations;

namespace Lucde.Api.Dtos;

/// <summary>Authenticated account information.</summary>
public sealed record AccountResponse(
	Guid Id,
	string FullName,
	string Email,
	bool EmailConfirmed,
	IReadOnlyList<string> Roles,
	DateTimeOffset CreatedAt);

/// <summary>Student profile details visible to the profile owner.</summary>
public sealed record StudentProfileResponse(string DisplayName, string? Bio);

/// <summary>Editable fields on the authenticated student's profile.</summary>
public sealed record UpdateStudentProfileRequest
{
	[Required, StringLength(120, MinimumLength = 2)]
	public required string DisplayName { get; init; }

	[StringLength(1000)]
	public string? Bio { get; init; }
}

/// <summary>Instructor profile details visible to the profile owner.</summary>
public sealed record InstructorProfileResponse(string DisplayName, string? Bio, string? Expertise);

/// <summary>Editable fields on the authenticated instructor's profile.</summary>
public sealed record UpdateInstructorProfileRequest
{
	[Required, StringLength(120, MinimumLength = 2)]
	public required string DisplayName { get; init; }

	[StringLength(2000)]
	public string? Bio { get; init; }

	[StringLength(500)]
	public string? Expertise { get; init; }
}

/// <summary>Notification belonging to the authenticated user.</summary>
public sealed record NotificationResponse(
	Guid Id,
	string Type,
	string Title,
	string Message,
	bool IsRead,
	DateTimeOffset CreatedAt);

/// <summary>Summary returned when an authenticated user opens their role dashboard.</summary>
public sealed record DashboardResponse(string Role, string Message);
