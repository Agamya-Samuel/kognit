import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationsRepository } from '../../../db/repositories/notifications.repository';
import { LiveClassesRepository } from '../../../db/repositories/live-classes.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { CoursesRepository } from '../../../db/repositories/courses.repository';
import type { LiveClass } from '../../../db/schema';

export interface NotificationPayload {
  liveClassId: number;
  type: 'class_scheduled' | 'class_reminder_1hr' | 'class_reminder_15min' | 'class_cancelled' | 'class_started' | 'recording_ready';
  title: string;
  body: string;
}

@Injectable()
export class LiveNotificationService {
  private readonly logger = new Logger(LiveNotificationService.name);

  private scheduledJobIds: Map<string, string> = new Map();

  constructor(
    @InjectQueue('scheduled-notifications') private scheduledQueue: Queue,
    private readonly notificationsRepo: NotificationsRepository,
    private readonly liveClassesRepo: LiveClassesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly coursesRepo: CoursesRepository,
  ) {}

  async scheduleClassNotifications(liveClass: LiveClass): Promise<void> {
    const scheduledTime = new Date(liveClass.scheduledAt);
    const now = new Date();

    const reminderTypes: Array<'class_reminder_1hr' | 'class_reminder_15min'> = [
      'class_reminder_1hr',
      'class_reminder_15min',
    ];

    for (const reminderType of reminderTypes) {
      const offsetMs = reminderType === 'class_reminder_1hr' ? 60 * 60 * 1000 : 15 * 60 * 1000;
      const triggerAt = new Date(scheduledTime.getTime() - offsetMs);
      const delay = triggerAt.getTime() - Date.now();

      if (delay > 0) {
        const job = await this.scheduledQueue.add(
          'send-reminder',
          {
            liveClassId: liveClass.id,
            type: reminderType,
          },
          {
            delay,
            jobId: `${liveClass.id}-${reminderType}`,
            removeOnComplete: true,
            removeOnFail: 20,
            attempts: 2,
            backoff: { type: 'exponential', delay: 5000 },
          },
        );
        this.scheduledJobIds.set(`${liveClass.id}-${reminderType}`, job.id!);
      }
    }

    this.logger.log(
      `Scheduled notifications for live class ${liveClass.id} at ${scheduledTime.toISOString()}`,
    );
  }

  async notifyClassScheduled(liveClass: LiveClass): Promise<number> {
    const studentIds = await this.getEnrolledStudentIds(liveClass);
    const sessionTitle = liveClass.title || 'Live Class';

    let notified = 0;
    for (const studentId of studentIds) {
      try {
        await this.notificationsRepo.create({
          userId: studentId,
          type: 'class_scheduled',
          title: 'New Live Class Scheduled',
          body: `"${sessionTitle}" has been scheduled for ${this.formatDateIST(liveClass.scheduledAt)}`,
          isRead: false,
          deliveredVia: 'both',
          emailSentAt: null,
        });
        notified++;
      } catch (error) {
        this.logger.error(`Failed to notify student ${studentId}:`, error);
      }
    }

    this.logger.log(`Notified ${notified} students about scheduled class ${liveClass.id}`);

    await this.scheduleClassNotifications(liveClass);

    return notified;
  }

  async notifyClassCancelled(liveClass: LiveClass): Promise<number> {
    const studentIds = await this.getEnrolledStudentIds(liveClass);
    const sessionTitle = liveClass.title || 'Live Class';

    let notified = 0;
    for (const studentId of studentIds) {
      try {
        await this.notificationsRepo.create({
          userId: studentId,
          type: 'class_cancelled',
          title: 'Live Class Cancelled',
          body: `"${sessionTitle}" scheduled for ${this.formatDateIST(liveClass.scheduledAt)} has been cancelled.`,
          isRead: false,
          deliveredVia: 'both',
          emailSentAt: null,
        });
        notified++;
      } catch (error) {
        this.logger.error(`Failed to notify student ${studentId}:`, error);
      }
    }

    await this.cancelScheduledNotifications(liveClass.id);

    this.logger.log(`Notified ${notified} students about cancelled class ${liveClass.id}`);
    return notified;
  }

  async notifyClassStarted(liveClass: LiveClass): Promise<number> {
    const studentIds = await this.getEnrolledStudentIds(liveClass);
    const sessionTitle = liveClass.title || 'Live Class';

    let notified = 0;
    for (const studentId of studentIds) {
      try {
        await this.notificationsRepo.create({
          userId: studentId,
          type: 'class_started',
          title: 'Live Class Started!',
          body: `"${sessionTitle}" is now live. Join now!`,
          isRead: false,
          deliveredVia: 'in_app',
          emailSentAt: null,
        });
        notified++;
      } catch (error) {
        this.logger.error(`Failed to notify student ${studentId}:`, error);
      }
    }

    this.logger.log(`Notified ${notified} students that class ${liveClass.id} started`);
    return notified;
  }

  async notifyRecordingReady(liveClass: LiveClass): Promise<number> {
    const studentIds = await this.getEnrolledStudentIds(liveClass);
    const sessionTitle = liveClass.title || 'Live Class';

    let notified = 0;
    for (const studentId of studentIds) {
      try {
        await this.notificationsRepo.create({
          userId: studentId,
          type: 'recording_ready',
          title: 'Recording Available',
          body: `The recording for "${sessionTitle}" is now available for playback.`,
          isRead: false,
          deliveredVia: 'both',
          emailSentAt: null,
        });
        notified++;
      } catch (error) {
        this.logger.error(`Failed to notify student ${studentId}:`, error);
      }
    }

    this.logger.log(`Notified ${notified} students about recording for class ${liveClass.id}`);
    return notified;
  }

  async sendReminder(liveClassId: number, type: 'class_reminder_1hr' | 'class_reminder_15min'): Promise<number> {
    const liveClass = await this.liveClassesRepo.findById(liveClassId);
    if (!liveClass) {
      this.logger.warn(`Live class ${liveClassId} not found for reminder`);
      return 0;
    }

    if (liveClass.status === 'cancelled') {
      this.logger.log(`Skipping reminder for cancelled class ${liveClassId}`);
      return 0;
    }

    const studentIds = await this.getEnrolledStudentIds(liveClass);
    const sessionTitle = liveClass.title || 'Live Class';

    const timeLabel = type === 'class_reminder_1hr' ? '1 hour' : '15 minutes';
    const title = type === 'class_reminder_1hr'
      ? 'Live Class in 1 Hour'
      : 'Live Class Starting Soon!';

    let notified = 0;
    for (const studentId of studentIds) {
      try {
        await this.notificationsRepo.create({
          userId: studentId,
          type,
          title,
          body: `"${sessionTitle}" starts in ${timeLabel} at ${this.formatTimeIST(liveClass.scheduledAt)}.`,
          isRead: false,
          deliveredVia: 'both',
          emailSentAt: null,
        });
        notified++;
      } catch (error) {
        this.logger.error(`Failed to send reminder to student ${studentId}:`, error);
      }
    }

    this.logger.log(`Sent ${timeLabel} reminder to ${notified} students for class ${liveClassId}`);
    return notified;
  }

  // --- Private Helpers ---

  private async getEnrolledStudentIds(liveClass: LiveClass): Promise<number[]> {
    const enrollments = await this.enrollmentsRepo.findByCourse(liveClass.courseId, { limit: 500 });
    return enrollments.data.map(e => e.studentId);
  }

  private async cancelScheduledNotifications(liveClassId: number): Promise<void> {
    for (const [key, jobId] of this.scheduledJobIds) {
      if (key.startsWith(`${liveClassId}-`)) {
        try {
          await this.scheduledQueue.remove(jobId);
        } catch (error) {
          this.logger.warn(`Failed to remove scheduled job ${jobId}:`, error);
        }
        this.scheduledJobIds.delete(key);
      }
    }
  }

  private formatDateIST(date: Date | string): string {
    const d = new Date(date);
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + istOffsetMs);

    const day = istDate.getUTCDate();
    const month = istDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    const year = istDate.getUTCFullYear();

    return `${day} ${month} ${year}`;
  }

  private formatTimeIST(date: Date | string): string {
    const d = new Date(date);
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + istOffsetMs);

    const hours = istDate.getUTCHours();
    const minutes = istDate.getUTCMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = String(minutes).padStart(2, '0');

    return `${displayHours}:${displayMinutes} ${ampm} IST`;
  }
}
