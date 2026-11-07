using System.Security.Claims;
using Lucde.Api.Dtos;
using Lucde.Api.Middleware;
using Lucde.Api.Models;
using Lucde.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Lucde.Api.Endpoints;

public static class AccountEndpoints
{
	public static void MapAccountEndpoints(this IEndpointRouteBuilder endpoints)
	{
		var group = endpoints.MapGroup("/api")
			.WithTags("Accounts")
			.RequireAuthorization();

		group.MapGet("/account/me", async Task<Ok<AccountResponse>> (
			ClaimsPrincipal principal, IAccountService accounts, CancellationToken cancellationToken) =>
			TypedResults.Ok(await accounts.GetAccountAsync(GetUserId(principal), cancellationToken)))
			.WithSummary("Get the authenticated user's account information");

		group.MapGet("/account/notifications", async Task<Ok<IReadOnlyList<NotificationResponse>>> (
			ClaimsPrincipal principal, IAccountService accounts, CancellationToken cancellationToken) =>
			TypedResults.Ok(await accounts.GetNotificationsAsync(GetUserId(principal), cancellationToken)))
			.WithSummary("List notifications belonging to the authenticated user");

		var student = group.MapGroup("/student").RequireAuthorization(policy => policy.RequireRole(AppRoles.Student));
		student.MapGet("/dashboard", async Task<Ok<DashboardResponse>> (
			ClaimsPrincipal principal, IAccountService accounts, CancellationToken cancellationToken) =>
			TypedResults.Ok(await accounts.GetDashboardAsync(GetUserId(principal), AppRoles.Student, cancellationToken)))
			.WithSummary("Open the student's own dashboard");
		student.MapGet("/profile", async Task<Ok<StudentProfileResponse>> (
			ClaimsPrincipal principal, IAccountService accounts, CancellationToken cancellationToken) =>
			TypedResults.Ok(await accounts.GetStudentProfileAsync(GetUserId(principal), cancellationToken)))
			.WithSummary("Get the authenticated student's profile");
		student.MapPut("/profile", async Task<Ok<StudentProfileResponse>> (
			UpdateStudentProfileRequest request, ClaimsPrincipal principal, IAccountService accounts, CancellationToken cancellationToken) =>
			TypedResults.Ok(await accounts.UpdateStudentProfileAsync(GetUserId(principal), request, cancellationToken)))
			.WithSummary("Update the authenticated student's own profile");

		var instructor = group.MapGroup("/instructor").RequireAuthorization(policy => policy.RequireRole(AppRoles.Instructor));
		instructor.MapGet("/dashboard", async Task<Ok<DashboardResponse>> (
			ClaimsPrincipal principal, IAccountService accounts, CancellationToken cancellationToken) =>
			TypedResults.Ok(await accounts.GetDashboardAsync(GetUserId(principal), AppRoles.Instructor, cancellationToken)))
			.WithSummary("Open the instructor's own workspace");
		instructor.MapGet("/profile", async Task<Ok<InstructorProfileResponse>> (
			ClaimsPrincipal principal, IAccountService accounts, CancellationToken cancellationToken) =>
			TypedResults.Ok(await accounts.GetInstructorProfileAsync(GetUserId(principal), cancellationToken)))
			.WithSummary("Get the authenticated instructor's profile");
		instructor.MapPut("/profile", async Task<Ok<InstructorProfileResponse>> (
			UpdateInstructorProfileRequest request, ClaimsPrincipal principal, IAccountService accounts, CancellationToken cancellationToken) =>
			TypedResults.Ok(await accounts.UpdateInstructorProfileAsync(GetUserId(principal), request, cancellationToken)))
			.WithSummary("Update the authenticated instructor's own profile");
	}

	private static Guid GetUserId(ClaimsPrincipal principal)
	{
		var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
		return Guid.TryParse(userId, out var parsed)
			? parsed
			: throw new ApiException(StatusCodes.Status401Unauthorized, "Unauthorized", "The access token is invalid.");
	}
}
