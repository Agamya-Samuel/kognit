import { Processor } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { renderTemplate } from '../../email/email-renderer';
import { EMAIL_PROVIDER } from '../../modules/notifications/providers/providers.tokens';
import type { EmailProvider } from '../../modules/notifications/providers/email.provider';

interface EmailJobData {
  to: string;
  subject: string;
  templateName?: string;
  templateData?: Record<string, unknown>;
  notificationId?: number;
}

@Processor('email-notifications')
export class EmailNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailNotificationProcessor.name);

  constructor(
    @Inject(EMAIL_PROVIDER)
    private readonly emailProvider: EmailProvider,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>) {
    const { to, subject, templateName, templateData, notificationId } = job.data;
    this.logger.log(
      `Processing email job ${job.id} to ${to} | template: ${templateName ?? 'none'} | notification: ${notificationId ?? 'n/a'}`,
    );

    let html: string;
    let text: string | undefined;

    if (templateName && templateData) {
      try {
        const rendered = await renderTemplate(templateName, templateData);
        html = rendered.html;
        text = rendered.text;
      } catch (err) {
        this.logger.error(
          `Failed to render template "${templateName}" for job ${job.id}: ${err}`,
        );
        throw err; // let BullMQ retry
      }
    } else {
      // Fallback: plain-text email with the subject as body
      html = `<p>${subject}</p>`;
      text = subject;
    }

    try {
      await this.emailProvider.send({ to, subject, html, text });
      this.logger.log(`Email sent successfully for job ${job.id} to ${to}`);
    } catch (err) {
      this.logger.error(
        `Failed to send email for job ${job.id} to ${to}: ${err}`,
      );
      throw err; // let BullMQ retry
    }

    return { success: true, jobId: job.id, to };
  }
}
