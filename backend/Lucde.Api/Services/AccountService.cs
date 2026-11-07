using System.Security.Claims;
using Lucde.Api.Data;
using Lucde.Api.Dtos;
using Lucde.Api.Middleware;
using Lucde.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Lucde.Api.Services;

public sealed class AccountService(
	AppDbContext database,
	UserManager<AppUser> users) : IAccountService
{
	public async Task<AccountResponse> GetAccountAsync(Guid userId, CancellationToken cancellationToken)
	{
		var user = await users.FindByIdAsync(userId.ToString())
			?? throw NotFound("Account not found.");
		var roles = await users.GetRolesAsync(user);
		return new AccountResponse(user.Id, user.FullName, user.Email!, user.EmailConfirmed, roles.ToArray(), user.CreatedAt);
	}

	public async Task<DashboardResponse> GetDashboardAsync(Guid userId, string role, CancellationToken cancellationToken)
	{
		var exists = await users.Users.AnyAsync(user => user.Id == userId && user.IsActive, cancellationToken);
		if (!exists)
			throw NotFound("Account not found.");
		var message = role switch
		{
			AppRoles.Student => "Your student learning dashboard is ready.",
			AppRoles.Instructor => "Your instructor workspace is ready.",
			AppRoles.Admin => "Your administration dashboard is ready.",
			_ => throw new ApiException(StatusCodes.Status403Forbidden, "Forbidden", "This dashboard is not available.")
		};
		return new DashboardResponse(role, message);
	}

	public async Task<StudentProfileResponse> GetStudentProfileAsync(Guid userId, CancellationToken cancellationToken)
	{
		var profile = await database.StudentProfiles.AsNoTracking()
			.SingleOrDefaultAsync(item => item.UserId == userId, cancellationToken)
			?? throw NotFound("Student profile not found.");
		return new StudentProfileResponse(profile.DisplayName, profile.Bio);
	}

	public async Task<StudentProfileResponse> UpdateStudentProfileAsync(Guid userId, UpdateStudentProfileRequest request, CancellationToken cancellationToken)
	{
		var profile = await database.StudentProfiles
			.SingleOrDefaultAsync(item => item.UserId == userId, cancellationToken)
			?? throw NotFound("Student profile not found.");
		profile.DisplayName = request.DisplayName.Trim();
		profile.Bio = request.Bio?.Trim();
		profile.UpdatedAt = DateTimeOffset.UtcNow;
		await database.SaveChangesAsync(cancellationToken);
		return new StudentProfileResponse(profile.DisplayName, profile.Bio);
	}

	public async Task<InstructorProfileResponse> GetInstructorProfileAsync(Guid userId, CancellationToken cancellationToken)
	{
		var profile = await database.InstructorProfiles.AsNoTracking()
			.SingleOrDefaultAsync(item => item.UserId == userId, cancellationToken)
			?? throw NotFound("Instructor profile not found.");
		return new InstructorProfileResponse(profile.DisplayName, profile.Bio, profile.Expertise);
	}

	public async Task<InstructorProfileResponse> UpdateInstructorProfileAsync(Guid userId, UpdateInstructorProfileRequest request, CancellationToken cancellationToken)
	{
		var profile = await database.InstructorProfiles
			.SingleOrDefaultAsync(item => item.UserId == userId, cancellationToken)
			?? throw NotFound("Instructor profile not found.");
		profile.DisplayName = request.DisplayName.Trim();
		profile.Bio = request.Bio?.Trim();
		profile.Expertise = request.Expertise?.Trim();
		profile.UpdatedAt = DateTimeOffset.UtcNow;
		await database.SaveChangesAsync(cancellationToken);
		return new InstructorProfileResponse(profile.DisplayName, profile.Bio, profile.Expertise);
	}

	public async Task<IReadOnlyList<NotificationResponse>> GetNotificationsAsync(Guid userId, CancellationToken cancellationToken) =>
		await database.Notifications.AsNoTracking()
			.Where(notification => notification.UserId == userId)
			.OrderByDescending(notification => notification.CreatedAt)
			.Take(50)
			.Select(notification => new NotificationResponse(notification.Id, notification.Type, notification.Title,
				notification.Message, notification.IsRead, notification.CreatedAt))
			.ToListAsync(cancellationToken);

	private static ApiException NotFound(string detail) =>
		new(StatusCodes.Status404NotFound, "Not Found", detail);
}
