namespace Lucde.Api.Models;

public sealed class InstructorProfile
{
	public Guid Id { get; set; }
	public Guid UserId { get; set; }
	public required string DisplayName { get; set; }
	public string? Bio { get; set; }
	public string? Expertise { get; set; }
	public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
	public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
	public AppUser User { get; set; } = null!;
}
