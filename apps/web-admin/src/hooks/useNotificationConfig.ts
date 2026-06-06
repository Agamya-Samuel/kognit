import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

export function useNotificationConfig() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'notifications', 'config'],
    queryFn: async () => {
      const res = await adminService.getNotificationConfig();
      return res.data;
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: (configData: Record<string, unknown>) =>
      adminService.updateUserNotificationPreferences(0, configData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'config'] });
    },
  });

  return {
    config: data,
    isLoading,
    error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
  };
}

export function useUserNotificationPreferences(userId: number) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'notifications', 'user', userId],
    queryFn: async () => {
      const res = await adminService.getUserNotificationPreferences(userId);
      return res.data;
    },
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: (preferences: Record<string, unknown>) =>
      adminService.updateUserNotificationPreferences(userId, preferences),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'user', userId] });
    },
  });

  return {
    preferences: data,
    isLoading,
    error,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
