using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Lucde.Api.Data;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
	public AppDbContext CreateDbContext(string[] args)
	{
		var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Default")
			?? "Server=(localdb)\\SteelConnections2026;Database=LucdePhase2Dev;Trusted_Connection=True;TrustServerCertificate=True";
		var options = new DbContextOptionsBuilder<AppDbContext>()
			.UseSqlServer(connectionString)
			.Options;
		return new AppDbContext(options);
	}
}
