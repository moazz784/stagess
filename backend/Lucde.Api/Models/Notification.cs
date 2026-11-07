namespace Lucde.Api.Models;

public sealed class Notification
{
	public Guid Id { get; set; }
	public Guid UserId { get; set; }
	public required string Type { get; set; }
	public required string Title { get; set; }
	public required string Message { get; set; }
	public bool IsRead { get; set; }
	public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
	public AppUser User { get; set; } = null!;
}
