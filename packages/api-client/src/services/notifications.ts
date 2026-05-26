import { getApiClient } from '../index';

export interface Notification {
  id: number;
  type: string;
  title: string;
  body?: string | null;
  isRead: boolean;
  deliveredVia: string;
  emailSentAt?: string | null;
  createdAt: string;
}

export interface NotificationFilters {
  limit?: number;
  offset?: number;
  isRead?: boolean;
  type?: string;
}

export interface NotificationPreferencesDto {
  emailNotifications?: boolean;
  assignmentReminders?: boolean;
  liveClassAlerts?: boolean;
  marketingEmails?: boolean;
}

export const notificationsService = {
  /**
   * Get user notifications with optional filtering
   * @param filters - Filter options for notifications
   * @returns List of notifications
   */
  getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    return getApiClient().get<Notification[]>('/notifications', filters as Record<string, unknown>);
  },

  /**
   * Get unread notifications count
   * @returns Count of unread notifications
   */
  getUnreadCount(): Promise<{ count: number }> {
    return getApiClient().get<{ count: number }>('/notifications/unread-count');
  },

  /**
   * Mark notification as read
   * @param id - Notification ID
   * @returns Updated notification
   */
  markAsRead(id: number): Promise<Notification> {
    return getApiClient().patch<Notification>(`/notifications/${id}/read`, {});
  },

  /**
   * Mark all notifications as read
   * @returns Count of notifications marked as read
   */
  markAllAsRead(): Promise<{ count: number }> {
    return getApiClient().patch<{ count: number }>('/notifications/read-all', {});
  },

  /**
   * Delete notification
   * @param id - Notification ID
   * @returns Success status
   */
  deleteNotification(id: number): Promise<{ success: boolean }> {
    return getApiClient().delete<{ success: boolean }>(`/notifications/${id}`);
  },

  /**
   * Get notification preferences
   * @returns User's notification preferences
   */
  getPreferences(): Promise<NotificationPreferencesDto> {
    return getApiClient().get<NotificationPreferencesDto>('/notifications/preferences');
  },

  /**
   * Update notification preferences
   * @param preferences - New notification preferences
   * @returns Updated preferences
   */
  updatePreferences(preferences: NotificationPreferencesDto): Promise<NotificationPreferencesDto> {
    return getApiClient().patch<NotificationPreferencesDto>('/notifications/preferences', preferences);
  },
};