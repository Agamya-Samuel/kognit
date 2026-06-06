import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('scheduled-notifications')
export class ScheduledNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(ScheduledNotificationProcessor.name);

  async process(job: Job) {
    const { liveClassId, type } = job.data;
    this.logger.log(`Processing scheduled notification job ${job.id} for live class ${liveClassId}, type: ${type}`);
    return { success: true, jobId: job.id, liveClassId };
  }
}
