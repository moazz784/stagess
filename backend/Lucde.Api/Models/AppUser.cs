using Microsoft.AspNetCore.Identity;

namespace Lucde.Api.Models;

public sealed class AppUser : IdentityUser<Guid>
{
	public required string FullName { get; set; }
	public bool IsActive { get; set; } = true;
	public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
	public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
	public StudentProfile? StudentProfile { get; set; }
	public InstructorProfile? InstructorProfile { get; set; }
	public ICollection<RefreshToken> RefreshTokens { get; } = [];
	public ICollection<Notification> Notifications { get; } = [];
	public ICollection<AuditLog> AuditLogs { get; } = [];
}
