import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaProcessingProcessor } from './processors/media-processing.processor';
import { EmailNotificationProcessor } from './processors/email-notification.processor';
import { CertificateGenerationProcessor } from './processors/certificate-generation.processor';
import { SmsNotificationProcessor } from './processors/sms-notification.processor';
import { ScheduledNotificationProcessor } from './processors/scheduled-notification.processor';
import { ProvidersModule } from '../modules/notifications/providers/providers.module';

const defaultJobOptions = {
  removeOnComplete: 10,
  removeOnFail: 20,
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
};

@Module({
  imports: [
    ProvidersModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
          db: config.get<number>('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'media-processing', defaultJobOptions },
      { name: 'email-notifications', defaultJobOptions },
      { name: 'certificate-generation', defaultJobOptions },
      { name: 'scheduled-notifications', defaultJobOptions },
      { name: 'sms-notifications', defaultJobOptions },
    ),
  ],
  providers: [
    MediaProcessingProcessor,
    EmailNotificationProcessor,
    CertificateGenerationProcessor,
    SmsNotificationProcessor,
    ScheduledNotificationProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule {}
