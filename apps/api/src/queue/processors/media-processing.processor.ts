import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('media-processing')
export class MediaProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessingProcessor.name);

  async process(job: Job) {
    this.logger.log(`Processing media job ${job.id}: ${job.name}`);
    return { success: true, jobId: job.id };
  }
}
