import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { EmailProvider } from './email.provider';

@Injectable()
export class SesEmailProvider implements EmailProvider {
  private readonly logger = new Logger(SesEmailProvider.name);
  private readonly sesClient: SESv2Client;
  private readonly sourceEmail: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.sourceEmail = this.configService.get<string>('SES_SOURCE_EMAIL') || '';

    if (!this.sourceEmail) {
      this.logger.warn('SES_SOURCE_EMAIL not configured. SES email provider is disabled.');
    }

    this.sesClient = new SESv2Client({ region });
    this.logger.log('SesEmailProvider initialized');
  }

  async send(params: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    try {
      if (!this.sourceEmail) {
        this.logger.warn('Cannot send email: SES_SOURCE_EMAIL not configured');
        return;
      }

      await this.sesClient.send(
        new SendEmailCommand({
          FromEmailAddress: this.sourceEmail,
          Destination: { ToAddresses: [params.to] },
          Content: {
            Simple: {
              Subject: { Data: params.subject },
              Body: {
                Html: { Data: params.html },
                ...(params.text && { Text: { Data: params.text } }),
              },
            },
          },
        }),
      );
    } catch (error) {
      this.logger.error('Failed to send email via SES', error);
      throw error;
    }
  }

  async bulkSend(params: { recipients: string[]; subject: string; html: string; text?: string }): Promise<void> {
    if (params.recipients.length === 0) return;

    await Promise.all(
      params.recipients.map((to) =>
        this.send({ to, subject: params.subject, html: params.html, text: params.text }),
      ),
    );
  }
}
