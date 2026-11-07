using Lucde.Api.Data;
using Lucde.Api.Dtos;
using Lucde.Api.Middleware;
using Lucde.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Lucde.Api.Services;

public sealed class AdminService(
	AppDbContext database,
	UserManager<AppUser> users) : IAdminService
{
	public async Task<AdminUserPageResponse> GetUsersAsync(int page, int pageSize, CancellationToken cancellationToken)
	{
		if (page < 1 || pageSize is < 1 or > 100)
			throw new ApiException(StatusCodes.Status400BadRequest, "Invalid page", "Page must be positive and pageSize must be between 1 and 100.");

		var totalCount = await users.Users.CountAsync(cancellationToken);
		var result = new List<AdminUserResponse>();
		var records = await users.Users.AsNoTracking()
			.OrderBy(user => user.CreatedAt)
			.Skip((page - 1) * pageSize)
			.Take(pageSize)
			.ToListAsync(cancellationToken);
		foreach (var user in records)
		{
			var roles = await users.GetRolesAsync(user);
			result.Add(new AdminUserResponse(user.Id, user.FullName, user.Email!, user.EmailConfirmed,
				user.IsActive, roles.ToArray(), user.CreatedAt));
		}
		return new AdminUserPageResponse(result, page, pageSize, totalCount);
	}

	public async Task<AdminUserResponse> AssignRoleAsync(
		Guid actorId, Guid userId, AssignRoleRequest request, string ipAddress, CancellationToken cancellationToken)
	{
		if (!AppRoles.All.Contains(request.Role, StringComparer.Ordinal))
			throw new ApiException(StatusCodes.Status400BadRequest, "Invalid role", "Role must be Student, Instructor, or Admin.");

		var user = await users.FindByIdAsync(userId.ToString())
			?? throw new ApiException(StatusCodes.Status404NotFound, "Not Found", "User not found.");
		var currentRoles = await users.GetRolesAsync(user);
		if (currentRoles.Contains(AppRoles.Admin, StringComparer.Ordinal) && request.Role != AppRoles.Admin)
		{
			var administrators = await users.GetUsersInRoleAsync(AppRoles.Admin);
			if (administrators.Count(admin => admin.IsActive) <= 1)
				throw new ApiException(StatusCodes.Status409Conflict, "Role change rejected", "The last active administrator cannot be demoted.");
		}

		if (currentRoles.Count > 0)
		{
			var removeResult = await users.RemoveFromRolesAsync(user, currentRoles);
			if (!removeResult.Succeeded)
				throw new InvalidOperationException("The existing user roles could not be updated.");
		}

		var addResult = await users.AddToRoleAsync(user, request.Role);
		if (!addResult.Succeeded)
			throw new InvalidOperationException("The new user role could not be assigned.");

		if (request.Role == AppRoles.Student
			&& !await database.StudentProfiles.AnyAsync(profile => profile.UserId == userId, cancellationToken))
			database.StudentProfiles.Add(new StudentProfile { Id = Guid.NewGuid(), UserId = userId, DisplayName = user.FullName });
		if (request.Role == AppRoles.Instructor
			&& !await database.InstructorProfiles.AnyAsync(profile => profile.UserId == userId, cancellationToken))
			database.InstructorProfiles.Add(new InstructorProfile { Id = Guid.NewGuid(), UserId = userId, DisplayName = user.FullName });

		await SaveAuditAsync(actorId, "UserRoleChanged", $"{userId}:{request.Role}", ipAddress, cancellationToken);
		var roles = await users.GetRolesAsync(user);
		return new AdminUserResponse(user.Id, user.FullName, user.Email!, user.EmailConfirmed,
			user.IsActive, roles.ToArray(), user.CreatedAt);
	}

	public async Task SetUserActiveAsync(
		Guid actorId, Guid userId, SetUserActiveRequest request, string ipAddress, CancellationToken cancellationToken)
	{
		var user = await users.FindByIdAsync(userId.ToString())
			?? throw new ApiException(StatusCodes.Status404NotFound, "Not Found", "User not found.");

		if (!request.IsActive && userId == actorId)
			throw new ApiException(StatusCodes.Status409Conflict, "Account change rejected", "Administrators cannot deactivate their own account.");

		var roles = await users.GetRolesAsync(user);
		if (!request.IsActive && roles.Contains(AppRoles.Admin, StringComparer.Ordinal)
			&& (await users.GetUsersInRoleAsync(AppRoles.Admin)).Count(admin => admin.IsActive) <= 1)
			throw new ApiException(StatusCodes.Status409Conflict, "Account change rejected", "The last active administrator cannot be deactivated.");

		user.IsActive = request.IsActive;
		user.UpdatedAt = DateTimeOffset.UtcNow;
		var result = await users.UpdateAsync(user);
		if (!result.Succeeded)
			throw new InvalidOperationException("The account status could not be updated.");

		if (!request.IsActive)
			await database.RefreshTokens
				.Where(token => token.UserId == userId && token.RevokedAt == null)
				.ExecuteUpdateAsync(update => update.SetProperty(token => token.RevokedAt, DateTimeOffset.UtcNow), cancellationToken);

		await SaveAuditAsync(actorId, request.IsActive ? "UserActivated" : "UserDeactivated", userId.ToString(), ipAddress, cancellationToken);
	}

	private async Task SaveAuditAsync(Guid actorId, string action, string subject, string ipAddress, CancellationToken cancellationToken)
	{
		database.AuditLogs.Add(new AuditLog
		{
			Id = Guid.NewGuid(), UserId = actorId, Action = action, Subject = subject, IpAddress = ipAddress
		});
		await database.SaveChangesAsync(cancellationToken);
	}
}
