using Lucde.Api.Dtos;

namespace Lucde.Api.Services;

public interface IAccountService
{
	Task<AccountResponse> GetAccountAsync(Guid userId, CancellationToken cancellationToken);
	Task<DashboardResponse> GetDashboardAsync(Guid userId, string role, CancellationToken cancellationToken);
	Task<StudentProfileResponse> GetStudentProfileAsync(Guid userId, CancellationToken cancellationToken);
	Task<StudentProfileResponse> UpdateStudentProfileAsync(Guid userId, UpdateStudentProfileRequest request, CancellationToken cancellationToken);
	Task<InstructorProfileResponse> GetInstructorProfileAsync(Guid userId, CancellationToken cancellationToken);
	Task<InstructorProfileResponse> UpdateInstructorProfileAsync(Guid userId, UpdateInstructorProfileRequest request, CancellationToken cancellationToken);
	Task<IReadOnlyList<NotificationResponse>> GetNotificationsAsync(Guid userId, CancellationToken cancellationToken);
}
