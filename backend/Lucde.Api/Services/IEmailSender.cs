namespace Lucde.Api.Services;

public interface IEmailSender
{
	Task SendAsync(string email, string subject, string htmlBody, CancellationToken cancellationToken);
}
