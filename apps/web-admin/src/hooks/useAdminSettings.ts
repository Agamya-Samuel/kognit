import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '@edutech/api-client';

export function useAdminSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminService.getSettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settingsData: Record<string, string>) =>
      adminService.updateSettings(settingsData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
  });

  const updateSetting = async (key: string, value: string) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  return {
    settings: settings || {},
    isLoading,
    error,
    updateSetting,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
}
