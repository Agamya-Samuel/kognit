import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { SmsProvider } from './sms.provider';

@Injectable()
export class SnsSmsProvider implements SmsProvider {
  private readonly logger = new Logger(SnsSmsProvider.name);
  private readonly snsClient: SNSClient;
  private readonly senderId?: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.senderId = this.configService.get<string>('SNS_SMS_SENDER_ID') || undefined;

    this.snsClient = new SNSClient({ region });
    this.logger.log('SnsSmsProvider initialized');
  }

  async send(params: { to: string; message: string }): Promise<void> {
    try {
      const publishParams: any = {
        PhoneNumber: params.to,
        Message: params.message,
      };

      if (this.senderId) {
        publishParams.MessageAttributes = {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: this.senderId,
          },
        };
      }

      await this.snsClient.send(new PublishCommand(publishParams));
    } catch (error) {
      this.logger.error('Failed to send SMS via SNS', error);
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
