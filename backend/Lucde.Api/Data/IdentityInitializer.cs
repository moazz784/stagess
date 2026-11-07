using Lucde.Api.Models;
using Microsoft.AspNetCore.Identity;

namespace Lucde.Api.Data;

public static class IdentityInitializer
{
	public static async Task InitializeAsync(IServiceProvider services, IConfiguration configuration, ILogger logger)
	{
		using var scope = services.CreateScope();
		var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
		foreach (var roleName in AppRoles.All)
		{
			if (await roles.RoleExistsAsync(roleName))
				continue;

			var result = await roles.CreateAsync(new IdentityRole<Guid>(roleName));
			if (!result.Succeeded)
				throw new InvalidOperationException($"Could not create the {roleName} role.");
		}

		var email = configuration["BootstrapAdmin:Email"];
		var password = configuration["BootstrapAdmin:Password"];
		if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(password))
		{
			logger.LogWarning("No bootstrap administrator configured; admin endpoints remain unavailable until an administrator is provisioned.");
			return;
		}
		if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
			throw new InvalidOperationException("Configure both BootstrapAdmin:Email and BootstrapAdmin:Password or neither.");

		var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
		var user = await users.FindByEmailAsync(email.Trim());
		if (user is null)
		{
			user = new AppUser
			{
				Id = Guid.NewGuid(),
				UserName = email.Trim(),
				Email = email.Trim(),
				EmailConfirmed = true,
				FullName = "Platform Administrator"
			};
			var createResult = await users.CreateAsync(user, password);
			if (!createResult.Succeeded)
				throw new InvalidOperationException("The bootstrap administrator could not be created.");
		}
		else if (!user.EmailConfirmed)
		{
			user.EmailConfirmed = true;
			var confirmResult = await users.UpdateAsync(user);
			if (!confirmResult.Succeeded)
				throw new InvalidOperationException("The bootstrap administrator email could not be confirmed.");
		}

		if (!await users.IsInRoleAsync(user, AppRoles.Admin))
		{
			var roleResult = await users.AddToRoleAsync(user, AppRoles.Admin);
			if (!roleResult.Succeeded)
				throw new InvalidOperationException("The bootstrap administrator role could not be assigned.");
		}
	}
}
