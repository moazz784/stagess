namespace Lucde.Api.Models;

public static class AppRoles
{
	public const string Student = "Student";
	public const string Instructor = "Instructor";
	public const string Admin = "Admin";

	public static readonly string[] All = [Student, Instructor, Admin];
}
