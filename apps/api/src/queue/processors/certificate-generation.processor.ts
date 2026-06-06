import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('certificate-generation')
export class CertificateGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(CertificateGenerationProcessor.name);

  async process(job: Job) {
    const { enrollmentId, userId, courseId } = job.data;
    this.logger.log(
      `Processing certificate generation job ${job.id} for user ${userId}, course ${courseId}`,
    );
    return { success: true, jobId: job.id, enrollmentId };
  }
}
