using Lucde.Api.Dtos;

namespace Lucde.Api.Services;

public interface IAdminService
{
	Task<AdminUserPageResponse> GetUsersAsync(int page, int pageSize, CancellationToken cancellationToken);
	Task<AdminUserResponse> AssignRoleAsync(Guid actorId, Guid userId, AssignRoleRequest request, string ipAddress, CancellationToken cancellationToken);
	Task SetUserActiveAsync(Guid actorId, Guid userId, SetUserActiveRequest request, string ipAddress, CancellationToken cancellationToken);
}
