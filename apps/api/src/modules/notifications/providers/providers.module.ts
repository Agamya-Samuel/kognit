import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EMAIL_PROVIDER, SMS_PROVIDER } from './providers.tokens';
import { SesEmailProvider } from './ses-email.provider';
import { ResendEmailProvider } from './resend-email.provider';
import { SnsSmsProvider } from './sns-sms.provider';
import { TwilioSmsProvider } from './twilio-sms.provider';

@Module({
  imports: [ConfigModule],
  providers: [
    SesEmailProvider,
    ResendEmailProvider,
    SnsSmsProvider,
    TwilioSmsProvider,
    {
      provide: EMAIL_PROVIDER,
      useFactory: (config: ConfigService, ses: SesEmailProvider, resend: ResendEmailProvider) => {
        const type = config.get<string>('EMAIL_PROVIDER', 'ses');
        if (type === 'resend') return resend;
        return ses;
      },
      inject: [ConfigService, SesEmailProvider, ResendEmailProvider],
    },
    {
      provide: SMS_PROVIDER,
      useFactory: (config: ConfigService, sns: SnsSmsProvider, twilio: TwilioSmsProvider) => {
        const type = config.get<string>('SMS_PROVIDER', 'sns');
        if (type === 'twilio') return twilio;
        return sns;
      },
      inject: [ConfigService, SnsSmsProvider, TwilioSmsProvider],
    },
  ],
  exports: [EMAIL_PROVIDER, SMS_PROVIDER],
})
export class ProvidersModule {}
