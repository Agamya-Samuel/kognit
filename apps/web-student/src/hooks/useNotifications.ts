import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@edutech/api-client';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  deliveredVia?: string;
  emailSentAt?: string | null;
}

export interface NotificationFilters {
  limit?: number;
  offset?: number;
  isRead?: boolean;
  type?: string;
}

export function useNotifications(filters: NotificationFilters = {}) {
  return useQuery({
    queryKey: ['notifications', 'list', filters],
    queryFn: async () => {
      try {
        const result = await notificationsService.getNotifications(filters);
        if (!result) {
          return [];
        }
        if (Array.isArray(result)) {
          return result as unknown as Notification[];
        }
        if (result && typeof result === 'object' && 'data' in result && Array.isArray((result as any).data)) {
          return (result as any).data;
        }
        return [];
      } catch (error) {
        console.error('[useNotifications] API error:', error);
        return [];
      }
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      return notificationsService.getUnreadCount();
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: number) => {
      await notificationsService.markAsRead(notificationId);
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await notificationsService.markAllAsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}
