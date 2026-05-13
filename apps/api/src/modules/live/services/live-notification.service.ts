import { Injectable, Logger } from '@nestjs/common';
import { NotificationsRepository } from '../../../db/repositories/notifications.repository';
import { LiveClassesRepository } from '../../../db/repositories/live-classes.repository';
import { EnrollmentsRepository } from '../../../db/repositories/enrollments.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import { SectionsRepository } from '../../../db/repositories/sections.repository';
import type { LiveClass } from '../../../db/schema';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  liveClassId: number;
  type: 'class_scheduled' | 'class_reminder_1hr' | 'class_reminder_15min' | 'class_cancelled' | 'class_started' | 'recording_ready';
  title: string;
  body: string;
}

export interface ScheduledNotification {
  id: string;
  liveClassId: number;
  type: NotificationPayload['type'];
  triggerAt: Date;
  processed: boolean;
}

// ─── Live Notification Service ───────────────────────────────────────────────

@Injectable()
export class LiveNotificationService {
  private readonly logger = new Logger(LiveNotificationService.name);

  // In-memory queue for scheduled notifications.
  // In production, use a proper job queue (BullMQ, etc.)
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly notificationsRepo: NotificationsRepository,
    private readonly liveClassesRepo: LiveClassesRepository,
    private readonly enrollmentsRepo: EnrollmentsRepository,
    private readonly lecturesRepo: LecturesRepository,
    private readonly sectionsRepo: SectionsRepository,
  ) {
    // Start the notification checker (runs every minute)
    this.startNotificationChecker();
  }

  /**
   * Schedule notifications when a new class is created.
   * Auto-notify enrolled students (1hr before, 15min before).
   */
  async scheduleClassNotifications(liveClass: LiveClass): Promise<void> {
    const scheduledTime = new Date(liveClass.scheduledAt);
    const now = new Date();

    // 1 hour before notification
    const oneHourBefore = new Date(scheduledTime.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > now) {
      this.addScheduledNotification({
        liveClassId: liveClass.id,
        type: 'class_reminder_1hr',
        triggerAt: oneHourBefore,
      });
    }

    // 15 minutes before notification
    const fifteenMinBefore = new Date(scheduledTime.getTime() - 15 * 60 * 1000);
    if (fifteenMinBefore > now) {
      this.addScheduledNotification({
        liveClassId: liveClass.id,
        type: 'class_reminder_15min',
        triggerAt: fifteenMinBefore,
      });
    }

    this.logger.log(
      `Scheduled notifications for live class ${liveClass.id} at ${scheduledTime.toISOString()}`,
    );
  }

  /**
   * Notify enrolled students that a new class has been scheduled.
   */
  async notifyClassScheduled(liveClass: LiveClass): Promise<number> {
    const studentIds = await this.getEnrolledStudentIds(liveClass);

    const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
    const lectureTitle = lecture?.title ?? 'Live Class';

    let notified = 0;
    for (const studentId of studentIds) {
      try {
        await this.notificationsRepo.create({
          userId: studentId,
          type: 'class_scheduled',
          title: 'New Live Class Scheduled',
          body: `"${lectureTitle}" has been scheduled for ${this.formatDateIST(liveClass.scheduledAt)}`,
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

    // Schedule reminder notifications
    await this.scheduleClassNotifications(liveClass);

    return notified;
  }

  /**
   * Notify enrolled students that a class has been cancelled.
   */
  async notifyClassCancelled(liveClass: LiveClass): Promise<number> {
    const studentIds = await this.getEnrolledStudentIds(liveClass);

    const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
    const lectureTitle = lecture?.title ?? 'Live Class';

    let notified = 0;
    for (const studentId of studentIds) {
      try {
        await this.notificationsRepo.create({
          userId: studentId,
          type: 'class_cancelled',
          title: 'Live Class Cancelled',
          body: `"${lectureTitle}" scheduled for ${this.formatDateIST(liveClass.scheduledAt)} has been cancelled.`,
          isRead: false,
          deliveredVia: 'both',
          emailSentAt: null,
        });
        notified++;
      } catch (error) {
        this.logger.error(`Failed to notify student ${studentId}:`, error);
      }
    }

    // Cancel scheduled reminders
    this.cancelScheduledNotifications(liveClass.id);

    this.logger.log(`Notified ${notified} students about cancelled class ${liveClass.id}`);
    return notified;
  }

  /**
   * Notify enrolled students that a class has started.
   */
  async notifyClassStarted(liveClass: LiveClass): Promise<number> {
    const studentIds = await this.getEnrolledStudentIds(liveClass);

    const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
    const lectureTitle = lecture?.title ?? 'Live Class';

    let notified = 0;
    for (const studentId of studentIds) {
      try {
        await this.notificationsRepo.create({
          userId: studentId,
          type: 'class_started',
          title: 'Live Class Started!',
          body: `"${lectureTitle}" is now live. Join now!`,
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

  /**
   * Notify enrolled students that a recording is ready.
   */
  async notifyRecordingReady(liveClass: LiveClass): Promise<number> {
    const studentIds = await this.getEnrolledStudentIds(liveClass);

    const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
    const lectureTitle = lecture?.title ?? 'Live Class';

    let notified = 0;
    for (const studentId of studentIds) {
      try {
        await this.notificationsRepo.create({
          userId: studentId,
          type: 'recording_ready',
          title: 'Recording Available',
          body: `The recording for "${lectureTitle}" is now available for playback.`,
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

  /**
   * Send a reminder notification to enrolled students.
   */
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
    const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
    const lectureTitle = lecture?.title ?? 'Live Class';

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
          body: `"${lectureTitle}" starts in ${timeLabel} at ${this.formatTimeIST(liveClass.scheduledAt)}.`,
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

  // ─── Private Helpers ────────────────────────────────────────────────────

  private async getEnrolledStudentIds(liveClass: LiveClass): Promise<number[]> {
    const lecture = await this.lecturesRepo.findById(liveClass.lectureId);
    if (!lecture) return [];

    const section = await this.sectionsRepo.findById(lecture.sectionId);
    if (!section) return [];

    const enrollments = await this.enrollmentsRepo.findByCourse(section.courseId, { limit: 500 });
    return enrollments.data.map(e => e.studentId);
  }

  private addScheduledNotification(payload: {
    liveClassId: number;
    type: NotificationPayload['type'];
    triggerAt: Date;
  }): void {
    const id = `${payload.liveClassId}-${payload.type}-${payload.triggerAt.getTime()}`;
    this.scheduledNotifications.set(id, {
      id,
      ...payload,
      processed: false,
    });
  }

  private cancelScheduledNotifications(liveClassId: number): void {
    for (const [key, notification] of this.scheduledNotifications) {
      if (notification.liveClassId === liveClassId) {
        this.scheduledNotifications.delete(key);
      }
    }
  }

  private startNotificationChecker(): void {
    // Check every 60 seconds for due notifications
    this.intervalHandle = setInterval(() => {
      this.processDueNotifications();
    }, 60 * 1000);
  }

  private async processDueNotifications(): Promise<void> {
    const now = new Date();

    for (const [key, notification] of this.scheduledNotifications) {
      if (notification.processed) continue;
      if (notification.triggerAt <= now) {
        try {
          await this.sendReminder(notification.liveClassId, notification.type as any);
          notification.processed = true;
          this.scheduledNotifications.delete(key);
        } catch (error) {
          this.logger.error(`Failed to process notification ${key}:`, error);
        }
      }
    }
  }

  /**
   * Format date in IST (Asia/Kolkata).
   * IST is UTC+5:30 and does not observe DST.
   */
  private formatDateIST(date: Date | string): string {
    const d = new Date(date);
    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(d.getTime() + istOffsetMs);

    const day = istDate.getUTCDate();
    const month = istDate.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' });
    const year = istDate.getUTCFullYear();

    return `${day} ${month} ${year}`;
  }

  /**
   * Format time in IST.
   */
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

  /**
   * Clean up on module destroy.
   */
  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
    }
  }
}
