import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { platformSettingsService } from '@edutech/api-client';

export function useAdminSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => platformSettingsService.getAdminSettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (settingsData: Record<string, string>) =>
      platformSettingsService.updateAdminSettings(settingsData),
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