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
    queryFn: async (): Promise<Notification[]> => {
      const apiClient = getApiClient();
      const response = await apiClient.get<Notification[]>('/notifications', filters);
      return response;
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<{ count: number }> => {
      const apiClient = getApiClient();
      const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
      return response;
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