using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Lucde.Api.Middleware;

internal sealed class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
	public async ValueTask<bool> TryHandleAsync(
		HttpContext httpContext,
		Exception exception,
		CancellationToken cancellationToken)
	{
		if (exception is not ApiException apiException)
			return false;

		if (apiException.StatusCode >= StatusCodes.Status500InternalServerError)
			logger.LogError(exception, "API request failed: {Title}", apiException.Title);
		else
			logger.LogWarning("API request rejected with {StatusCode}: {Title}", apiException.StatusCode, apiException.Title);

		httpContext.Response.StatusCode = apiException.StatusCode;
		await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
		{
			Status = apiException.StatusCode,
			Title = apiException.Title,
			Detail = apiException.Detail,
			Instance = httpContext.Request.Path,
			Extensions = { ["errors"] = apiException.Errors }
		}, cancellationToken);
		return true;
	}
}
