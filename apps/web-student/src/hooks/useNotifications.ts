import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '@edutech/api-client';

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
      const apiClient = getApiClient();
      try {
        const result = await apiClient.get<{ data: Notification[] }>('/notifications', filters);
        if (result && typeof result === 'object' && 'data' in result && Array.isArray(result.data)) {
          return result.data as Notification[];
        }
        console.error('[useNotifications] Unexpected response structure:', result);
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
      const apiClient = getApiClient();
      const result = await apiClient.get<{ count: number }>('/notifications/unread-count');
      return result;
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: number) => {
      const apiClient = getApiClient();
      await apiClient.patch(`/notifications/${notificationId}/read`);
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
      const apiClient = getApiClient();
      await apiClient.patch('/notifications/read-all');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}