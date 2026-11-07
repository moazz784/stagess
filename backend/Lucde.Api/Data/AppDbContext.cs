using Lucde.Api.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Lucde.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
	: IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options)
{
	public DbSet<StudentProfile> StudentProfiles => Set<StudentProfile>();
	public DbSet<InstructorProfile> InstructorProfiles => Set<InstructorProfile>();
	public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
	public DbSet<Notification> Notifications => Set<Notification>();
	public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

	protected override void OnModelCreating(ModelBuilder builder)
	{
		base.OnModelCreating(builder);

		builder.Entity<AppUser>(entity =>
		{
			entity.Property(user => user.FullName).HasMaxLength(120).IsRequired();
			entity.Property(user => user.CreatedAt).HasColumnType("datetimeoffset");
			entity.Property(user => user.UpdatedAt).HasColumnType("datetimeoffset");
			entity.HasIndex(user => user.IsActive);
			entity.HasIndex(user => user.NormalizedEmail).IsUnique().HasDatabaseName("EmailIndex");
		});

		builder.Entity<StudentProfile>(entity =>
		{
			entity.HasKey(profile => profile.Id);
			entity.Property(profile => profile.DisplayName).HasMaxLength(120).IsRequired();
			entity.Property(profile => profile.Bio).HasMaxLength(1000);
			entity.HasIndex(profile => profile.UserId).IsUnique();
			entity.HasOne(profile => profile.User).WithOne(user => user.StudentProfile)
				.HasForeignKey<StudentProfile>(profile => profile.UserId).OnDelete(DeleteBehavior.Cascade);
		});

		builder.Entity<InstructorProfile>(entity =>
		{
			entity.HasKey(profile => profile.Id);
			entity.Property(profile => profile.DisplayName).HasMaxLength(120).IsRequired();
			entity.Property(profile => profile.Bio).HasMaxLength(2000);
			entity.Property(profile => profile.Expertise).HasMaxLength(500);
			entity.HasIndex(profile => profile.UserId).IsUnique();
			entity.HasOne(profile => profile.User).WithOne(user => user.InstructorProfile)
				.HasForeignKey<InstructorProfile>(profile => profile.UserId).OnDelete(DeleteBehavior.Cascade);
		});

		builder.Entity<RefreshToken>(entity =>
		{
			entity.HasKey(token => token.Id);
			entity.Property(token => token.TokenHash).HasMaxLength(64).IsRequired();
			entity.Property(token => token.CreatedByIp).HasMaxLength(45).IsRequired();
			entity.Property(token => token.RevokedByIp).HasMaxLength(45);
			entity.Property(token => token.ReplacedByTokenHash).HasMaxLength(64);
			entity.Property(token => token.CreatedAt).HasColumnType("datetimeoffset");
			entity.Property(token => token.ExpiresAt).HasColumnType("datetimeoffset");
			entity.Property(token => token.RevokedAt).HasColumnType("datetimeoffset");
			entity.HasIndex(token => token.TokenHash).IsUnique();
			entity.HasIndex(token => new { token.UserId, token.ExpiresAt });
			entity.HasOne(token => token.User).WithMany(user => user.RefreshTokens)
				.HasForeignKey(token => token.UserId).OnDelete(DeleteBehavior.Cascade);
		});

		builder.Entity<Notification>(entity =>
		{
			entity.HasKey(notification => notification.Id);
			entity.Property(notification => notification.Type).HasMaxLength(60).IsRequired();
			entity.Property(notification => notification.Title).HasMaxLength(160).IsRequired();
			entity.Property(notification => notification.Message).HasMaxLength(2000).IsRequired();
			entity.Property(notification => notification.CreatedAt).HasColumnType("datetimeoffset");
			entity.HasIndex(notification => new { notification.UserId, notification.CreatedAt });
			entity.HasOne(notification => notification.User).WithMany(user => user.Notifications)
				.HasForeignKey(notification => notification.UserId).OnDelete(DeleteBehavior.Cascade);
		});

		builder.Entity<AuditLog>(entity =>
		{
			entity.HasKey(log => log.Id);
			entity.Property(log => log.Action).HasMaxLength(100).IsRequired();
			entity.Property(log => log.Subject).HasMaxLength(450).IsRequired();
			entity.Property(log => log.IpAddress).HasMaxLength(45);
			entity.Property(log => log.CreatedAt).HasColumnType("datetimeoffset");
			entity.HasIndex(log => new { log.UserId, log.CreatedAt });
			entity.HasOne(log => log.User).WithMany(user => user.AuditLogs)
				.HasForeignKey(log => log.UserId).OnDelete(DeleteBehavior.SetNull);
		});
	}
}
