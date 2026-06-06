import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('sms-notifications')
export class SmsNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsNotificationProcessor.name);

  async process(job: Job) {
    const { to, message } = job.data;
    this.logger.log(`Processing SMS job ${job.id} to ${to}`);
    return { success: true, jobId: job.id, to };
  }
}
