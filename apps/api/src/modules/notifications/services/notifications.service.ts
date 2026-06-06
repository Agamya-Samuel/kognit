import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { NotificationsRepository } from '../../../db/repositories/notifications.repository';
import { UserNotificationPreferencesRepository } from '../repositories/notifications-preferences.repository';
import type { Notification } from '../../../db/schema/notifications';
import { NotificationPreferencesDto } from '../dto/notification-preferences.dto';

const DEFAULT_PREFERENCES = {
  emailEnrollments: true,
  emailSubmissions: true,
  emailReminders: true,
  emailMarketing: false,
  pushEnrollments: true,
  pushSubmissions: true,
  pushReminders: true,
  smsEnrollments: false,
  smsSubmissions: false,
  smsReminders: false,
  emailFrequency: 'immediate' as const,
  smsFrequency: 'immediate' as const,
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
    private readonly preferencesRepository: UserNotificationPreferencesRepository,
  ) {}

  async getNotifications(
    userId: number,
    options: { offset?: number; limit?: number; isRead?: boolean; type?: string } = {},
  ) {
    return this.notificationsRepository.findMany({
      ...options,
      userId,
    });
  }

  async getUnreadCount(userId: number): Promise<number> {
    return this.notificationsRepository.count({
      userId,
      isRead: false,
    });
  }

  async markAsRead(id: number, userId: number): Promise<Notification | null> {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      return null;
    }
    return this.notificationsRepository.markAsRead(id);
  }

  async markAllAsRead(userId: number): Promise<number> {
    return this.notificationsRepository.markAllAsRead(userId);
  }

  async deleteNotification(id: number, userId: number): Promise<boolean> {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification || notification.userId !== userId) {
      return false;
    }
    await this.notificationsRepository.markAsRead(id);
    return true;
  }

  async getPreferences(userId: number): Promise<Record<string, unknown>> {
    const preferences = await this.preferencesRepository.findByUserId(userId);
    if (!preferences) {
      return { ...DEFAULT_PREFERENCES };
    }
    return { ...preferences };
  }

  async updatePreferences(
    userId: number,
    preferences: NotificationPreferencesDto,
  ): Promise<Record<string, unknown>> {
    await this.preferencesRepository.upsert(userId, {
      emailEnrollments: preferences.emailEnrollments ?? DEFAULT_PREFERENCES.emailEnrollments,
      emailSubmissions: preferences.emailSubmissions ?? DEFAULT_PREFERENCES.emailSubmissions,
      emailReminders: preferences.emailReminders ?? DEFAULT_PREFERENCES.emailReminders,
      emailMarketing: preferences.emailMarketing ?? DEFAULT_PREFERENCES.emailMarketing,
      pushEnrollments: preferences.pushEnrollments ?? DEFAULT_PREFERENCES.pushEnrollments,
      pushSubmissions: preferences.pushSubmissions ?? DEFAULT_PREFERENCES.pushSubmissions,
      pushReminders: preferences.pushReminders ?? DEFAULT_PREFERENCES.pushReminders,
      smsEnrollments: preferences.smsEnrollments ?? DEFAULT_PREFERENCES.smsEnrollments,
      smsSubmissions: preferences.smsSubmissions ?? DEFAULT_PREFERENCES.smsSubmissions,
      smsReminders: preferences.smsReminders ?? DEFAULT_PREFERENCES.smsReminders,
      emailFrequency: preferences.emailFrequency ?? DEFAULT_PREFERENCES.emailFrequency,
      smsFrequency: preferences.smsFrequency ?? DEFAULT_PREFERENCES.smsFrequency,
    });
    return this.getPreferences(userId);
  }
}
