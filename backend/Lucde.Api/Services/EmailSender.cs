using System.Net;
using System.Net.Mail;

namespace Lucde.Api.Services;

public sealed class EmailSender(IConfiguration configuration, IHostEnvironment environment, ILogger<EmailSender> logger)
	: IEmailSender
{
	public async Task SendAsync(string email, string subject, string htmlBody, CancellationToken cancellationToken)
	{
		var host = configuration["Email:Smtp:Host"];
		if (string.IsNullOrWhiteSpace(host))
		{
			if (!environment.IsDevelopment())
				throw new InvalidOperationException("SMTP must be configured outside Development.");

			logger.LogInformation("Development-only email for {Email}: {Subject} {Body}", email, subject, htmlBody);
			return;
		}

		var senderAddress = configuration["Email:SenderAddress"]
			?? throw new InvalidOperationException("Email:SenderAddress must be configured when SMTP is enabled.");
		var port = configuration.GetValue<int?>("Email:Smtp:Port") ?? 587;
		using var message = new MailMessage(senderAddress, email, subject, htmlBody) { IsBodyHtml = true };
		using var client = new SmtpClient(host, port)
		{
			EnableSsl = configuration.GetValue("Email:Smtp:UseSsl", true),
			DeliveryMethod = SmtpDeliveryMethod.Network
		};

		var username = configuration["Email:Smtp:Username"];
		var password = configuration["Email:Smtp:Password"];
		if (!string.IsNullOrWhiteSpace(username))
			client.Credentials = new NetworkCredential(username, password);

		await client.SendMailAsync(message, cancellationToken);
	}
}
