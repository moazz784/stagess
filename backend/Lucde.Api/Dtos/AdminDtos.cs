using System.ComponentModel.DataAnnotations;

namespace Lucde.Api.Dtos;

/// <summary>User entry returned to administrators.</summary>
public sealed record AdminUserResponse(
	Guid Id,
	string FullName,
	string Email,
	bool EmailConfirmed,
	bool IsActive,
	IReadOnlyList<string> Roles,
	DateTimeOffset CreatedAt);

/// <summary>One page of user summaries returned to administrators.</summary>
public sealed record AdminUserPageResponse(
	IReadOnlyList<AdminUserResponse> Items,
	int Page,
	int PageSize,
	int TotalCount);

/// <summary>Request to assign one of the platform's predefined roles.</summary>
public sealed record AssignRoleRequest
{
	[Required, StringLength(30)]
	public required string Role { get; init; }
}

/// <summary>Request to enable or disable a user account.</summary>
public sealed record SetUserActiveRequest
{
	public required bool IsActive { get; init; }
}
