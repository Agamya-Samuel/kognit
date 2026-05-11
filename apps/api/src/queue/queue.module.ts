import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { MediaProcessingProcessor } from './processors/media-processing.processor';
import { EmailNotificationProcessor } from './processors/email-notification.processor';
import { CertificateGenerationProcessor } from './processors/certificate-generation.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'media-processing' },
      { name: 'email-notifications' },
      { name: 'certificate-generation' },
    ),
  ],
  providers: [
    MediaProcessingProcessor,
    EmailNotificationProcessor,
    CertificateGenerationProcessor,
  ],
  exports: [BullModule],
})
export class QueueModule {}
