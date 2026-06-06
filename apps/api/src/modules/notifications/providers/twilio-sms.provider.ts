import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';
import { SmsProvider } from './sms.provider';

@Injectable()
export class TwilioSmsProvider implements SmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private readonly client: twilio.Twilio;
  private readonly fromPhone: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';
    this.fromPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER') || '';

    if (!accountSid || !authToken || !this.fromPhone) {
      this.logger.warn('Twilio credentials not configured. Twilio SMS provider is disabled.');
      this.client = {} as twilio.Twilio;
    } else {
      this.client = twilio(accountSid, authToken);
      this.logger.log('TwilioSmsProvider initialized');
    }
  }

  async send(params: { to: string; message: string }): Promise<void> {
    try {
      if (!this.fromPhone) {
        this.logger.warn('Cannot send SMS: TWILIO_PHONE_NUMBER not configured');
        return;
      }

      await this.client.messages.create({
        body: params.message,
        from: this.fromPhone,
        to: params.to,
      });
    } catch (error) {
      this.logger.error('Failed to send SMS via Twilio', error);
      throw error;
    }
  }

  async bulkSend(params: { recipients: string[]; message: string }): Promise<void> {
    if (params.recipients.length === 0) return;

    await Promise.all(
      params.recipients.map((to) => this.send({ to, message: params.message })),
    );
  }
}
