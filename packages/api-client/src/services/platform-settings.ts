import { getApiClient } from '../index';

export interface PlatformSettings {
  [key: string]: string;
}

export const platformSettingsService = {
  /**
   * Get public platform settings
   * @returns Public settings as key-value pairs
   */
  getPublicSettings(): Promise<PlatformSettings> {
    return getApiClient().get<PlatformSettings>('/platform-settings');
  },

  /**
   * Get admin platform settings (requires admin role)
   * @returns All settings as key-value pairs
   */
  getAdminSettings(): Promise<PlatformSettings> {
    return getApiClient().get<PlatformSettings>('/platform-settings/admin');
  },

  /**
   * Update admin platform settings (requires admin role)
   * @param settings - Settings to update as key-value pairs
   * @returns Updated settings
   */
  updateAdminSettings(settings: PlatformSettings): Promise<PlatformSettings> {
    return getApiClient().patch<PlatformSettings>('/platform-settings/admin', settings);
  },
};