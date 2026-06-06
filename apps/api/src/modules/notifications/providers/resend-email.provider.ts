import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailProvider } from './email.provider';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly logger = new Logger(ResendEmailProvider.name);
  private readonly resend: any;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY') || '';
    this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || '';

    if (!apiKey || !this.fromEmail) {
      this.logger.warn('Resend credentials not configured. Resend email provider is disabled.');
      this.resend = null;
    } else {
      const { Resend } = require('resend');
      this.resend = new Resend(apiKey);
      this.logger.log('ResendEmailProvider initialized');
    }
  }

  async send(params: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    try {
      if (!this.fromEmail) {
        this.logger.warn('Cannot send email: RESEND_FROM_EMAIL not configured');
        return;
      }

      await this.resend.emails.send({
        from: this.fromEmail,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
    } catch (error) {
      this.logger.error('Failed to send email via Resend', error);
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
