import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('email-notifications')
export class EmailNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailNotificationProcessor.name);

  async process(job: Job) {
    const { to, subject, template } = job.data;
    this.logger.log(`Processing email job ${job.id} to ${to} with subject: ${subject}`);
    return { success: true, jobId: job.id, to };
  }
}
