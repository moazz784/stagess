namespace Lucde.Api.Middleware;

public sealed class ApiException(
	int statusCode,
	string title,
	string detail,
	IReadOnlyDictionary<string, string[]>? errors = null) : Exception(detail)
{
	public int StatusCode { get; } = statusCode;
	public string Title { get; } = title;
	public string Detail { get; } = detail;
	public IReadOnlyDictionary<string, string[]>? Errors { get; } = errors;
}
