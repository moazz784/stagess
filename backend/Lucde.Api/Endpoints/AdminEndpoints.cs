using System.Security.Claims;
using Lucde.Api.Dtos;
using Lucde.Api.Middleware;
using Lucde.Api.Models;
using Lucde.Api.Services;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Lucde.Api.Endpoints;

public static class AdminEndpoints
{
	public static void MapAdminEndpoints(this IEndpointRouteBuilder endpoints)
	{
		var group = endpoints.MapGroup("/api/admin")
			.WithTags("Administration")
			.RequireAuthorization(policy => policy.RequireRole(AppRoles.Admin));

		group.MapGet("/dashboard", async Task<Ok<DashboardResponse>> (
			ClaimsPrincipal principal, IAccountService accounts, CancellationToken cancellationToken) =>
			TypedResults.Ok(await accounts.GetDashboardAsync(GetUserId(principal), AppRoles.Admin, cancellationToken)))
			.WithSummary("Open the administration dashboard");

		group.MapGet("/users", async Task<Ok<AdminUserPageResponse>> (
			int? page, int? pageSize, IAdminService admin, CancellationToken cancellationToken) =>
			TypedResults.Ok(await admin.GetUsersAsync(page ?? 1, pageSize ?? 50, cancellationToken)))
			.WithSummary("List users for administrators");

		group.MapPut("/users/{userId:guid}/role", async Task<Ok<AdminUserResponse>> (
			Guid userId, AssignRoleRequest request, ClaimsPrincipal principal, HttpContext context,
			IAdminService admin, CancellationToken cancellationToken) =>
			TypedResults.Ok(await admin.AssignRoleAsync(GetUserId(principal), userId, request,
				context.Connection.RemoteIpAddress?.ToString() ?? "unknown", cancellationToken)))
			.WithSummary("Assign one of the three platform roles to a user");

		group.MapPut("/users/{userId:guid}/active", async Task<NoContent> (
			Guid userId, SetUserActiveRequest request, ClaimsPrincipal principal, HttpContext context,
			IAdminService admin, CancellationToken cancellationToken) =>
		{
			await admin.SetUserActiveAsync(GetUserId(principal), userId, request,
				context.Connection.RemoteIpAddress?.ToString() ?? "unknown", cancellationToken);
			return TypedResults.NoContent();
		})
			.WithSummary("Activate or deactivate a user account");
	}

	private static Guid GetUserId(ClaimsPrincipal principal)
	{
		var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
		return Guid.TryParse(userId, out var parsed)
			? parsed
			: throw new ApiException(StatusCodes.Status401Unauthorized, "Unauthorized", "The access token is invalid.");
	}
}
