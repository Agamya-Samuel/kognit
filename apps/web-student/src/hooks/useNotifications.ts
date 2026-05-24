import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '@edutech/api-client';

export interface Notification {
  id: number;
  userId: number;
  type: 'assignment_due' | 'assignment graded' | 'live_class_soon' | 'live_class_started' | 'certificate_issued' | 'payment_success' | 'course_enrolled';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ['notifications', 'list', { unreadOnly }],
    queryFn: async (): Promise<Notification[]> => {
      const apiClient = getApiClient();
      const response = await apiClient.get<{ data: Notification[] }>('/notifications', {
        params: { unreadOnly },
      });
      return response.data;
    },
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async (): Promise<number> => {
      const apiClient = getApiClient();
      const response = await apiClient.get<{ data: { count: number } }>('/notifications/unread-count');
      return response.data.count;
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
      await apiClient.post('/notifications/mark-all-read');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
  });
}