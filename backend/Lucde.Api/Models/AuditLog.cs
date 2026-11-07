namespace Lucde.Api.Models;

public sealed class AuditLog
{
	public Guid Id { get; set; }
	public Guid? UserId { get; set; }
	public required string Action { get; set; }
	public required string Subject { get; set; }
	public string? IpAddress { get; set; }
	public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
	public AppUser? User { get; set; }
}
