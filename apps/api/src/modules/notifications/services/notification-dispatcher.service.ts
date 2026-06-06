import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationsRepository } from '../../../db/repositories/notifications.repository';
import { UserNotificationPreferencesRepository } from '../repositories/notifications-preferences.repository';

export interface DispatchParams {
  userId: number;
  type: string;
  title: string;
  body: string;
  deliveredVia: 'in_app' | 'email' | 'both';
  channels?: Array<'email' | 'sms' | 'in_app'>;
  templateName?: string;
  templateData?: Record<string, unknown>;
  userEmail?: string;
  userPhone?: string;
  priority?: number;
  delay?: number;
}

export interface DispatchBulkParams {
  userIds: number[];
  type: string;
  title: string;
  body: string;
  deliveredVia: 'in_app' | 'email' | 'both';
  channels?: Array<'email' | 'sms' | 'in_app'>;
  templateName?: string;
  templateData?: Record<string, unknown>;
  priority?: number;
  delay?: number;
}

const SYSTEM_TYPES = ['payment', 'refund', 'password', 'verification', 'role_changed', 'course_moderation', 'instructor'];

@Injectable()
export class NotificationDispatcherService {
  private readonly logger = new Logger(NotificationDispatcherService.name);

  constructor(
    @InjectQueue('email-notifications') private emailQueue: Queue,
    @InjectQueue('sms-notifications') private smsQueue: Queue,
    private readonly notificationsRepo: NotificationsRepository,
    private readonly preferencesRepository: UserNotificationPreferencesRepository,
  ) {}

  shouldDeliverEmail(type: string, prefs: any): boolean {
    if (SYSTEM_TYPES.includes(type)) return true;
    if (!prefs) return type !== 'marketing';
    const t = type.toLowerCase();
    if (t.includes('enrollment') || t === 'enrolled' || t === 'course_enrolled') return prefs.emailEnrollments ?? true;
    if (t.includes('assignment') || t.includes('graded') || t.includes('submission')) return prefs.emailSubmissions ?? true;
    if (t.includes('reminder') || t.includes('live_class') || t.includes('class_')) return prefs.emailReminders ?? true;
    if (t.includes('marketing')) return prefs.emailMarketing ?? false;
    return true;
  }

  shouldDeliverSms(type: string, prefs: any): boolean {
    if (SYSTEM_TYPES.includes(type)) return false;
    if (!prefs) return false;
    const t = type.toLowerCase();
    if (t.includes('enrollment') || t === 'enrolled' || t === 'course_enrolled') return prefs.smsEnrollments ?? false;
    if (t.includes('assignment') || t.includes('graded') || t.includes('submission')) return prefs.smsSubmissions ?? false;
    if (t.includes('reminder') || t.includes('live_class') || t.includes('class_')) return prefs.smsReminders ?? false;
    return false;
  }

  shouldDeliverPush(type: string, prefs: any): boolean {
    if (SYSTEM_TYPES.includes(type)) return true;
    if (!prefs) return true;
    const t = type.toLowerCase();
    if (t.includes('enrollment') || t === 'enrolled' || t === 'course_enrolled') return prefs.pushEnrollments ?? true;
    if (t.includes('assignment') || t.includes('graded') || t.includes('submission')) return prefs.pushSubmissions ?? true;
    if (t.includes('reminder') || t.includes('live_class') || t.includes('class_')) return prefs.pushReminders ?? true;
    return true;
  }

  getFrequencyDelay(prefs: any, channel: 'email' | 'sms'): number | null {
    if (!prefs) return null;
    const freq = channel === 'email' ? prefs.emailFrequency : prefs.smsFrequency;
    if (!freq || freq === 'immediate') return null;
    if (freq === 'daily') return 60 * 60 * 1000;
    if (freq === 'weekly') return 7 * 24 * 60 * 60 * 1000;
    return null;
  }

  async dispatch(params: DispatchParams): Promise<{ notificationId: number; jobId?: string }> {
    const prefs = await this.preferencesRepository.findByUserId(params.userId);

    const shouldDeliverPush = this.shouldDeliverPush(params.type, prefs);
    const shouldDeliverEmail = this.shouldDeliverEmail(params.type, prefs);
    const shouldDeliverSms = this.shouldDeliverSms(params.type, prefs);

    if (!shouldDeliverPush && !shouldDeliverEmail && !shouldDeliverSms) {
      return { notificationId: 0 };
    }

    const notification = await this.notificationsRepo.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      deliveredVia: params.deliveredVia,
    });

    const result: { notificationId: number; jobId?: string } = { notificationId: notification.id };
    const channels = params.channels ?? ['in_app'];

    const includesEmail = channels.includes('email');
    const includesSms = channels.includes('sms');

    if (includesEmail && shouldDeliverEmail && params.userEmail) {
      try {
        const freqDelay = this.getFrequencyDelay(prefs, 'email');
        const effectiveDelay = params.delay ?? freqDelay ?? 0;

        const job = await this.emailQueue.add('send', {
          to: params.userEmail,
          subject: params.title,
          templateName: params.templateName,
          templateData: params.templateData,
          notificationId: notification.id,
        }, {
          delay: effectiveDelay,
          priority: params.priority ?? 5,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        });
        if (job?.id) {
          await this.notificationsRepo.updateJobId(notification.id, job.id);
          result.jobId = job.id;
        }
      } catch (error) {
        this.logger.error(`Failed to enqueue email for notification ${notification.id}: ${error}`);
      }
    }

    if (includesSms && shouldDeliverSms && params.userPhone) {
      try {
        const freqDelay = this.getFrequencyDelay(prefs, 'sms');
        const effectiveDelay = params.delay ?? freqDelay ?? 0;

        await this.smsQueue.add('send', {
          to: params.userPhone,
          body: params.body,
          notificationId: notification.id,
        }, {
          delay: effectiveDelay,
          priority: params.priority ?? 5,
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 },
        });
      } catch (error) {
        this.logger.error(`Failed to enqueue SMS for notification ${notification.id}: ${error}`);
      }
    }

    return result;
  }

  async dispatchBulk(params: DispatchBulkParams): Promise<number> {
    const results = await Promise.allSettled(
      params.userIds.map((userId) =>
        this.dispatch({
          userId,
          type: params.type,
          title: params.title,
          body: params.body,
          deliveredVia: params.deliveredVia,
          templateName: params.templateName,
          templateData: params.templateData,
          priority: params.priority,
          delay: params.delay,
        }),
      ),
    );

    return results.filter((r) => r.status === 'fulfilled' && r.value.notificationId > 0).length;
  }
}
