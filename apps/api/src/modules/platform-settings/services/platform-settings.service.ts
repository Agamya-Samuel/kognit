import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PlatformSettingsRepository } from './repositories/platform-settings.repository';
import type { PlatformSetting } from '../../db/schema/platform-settings';

@Injectable()
export class PlatformSettingsService {
  constructor(private readonly platformSettingsRepository: PlatformSettingsRepository) {}

  async getPublicSettings(): Promise<Record<string, string>> {
    try {
      // Define which settings are public
      const publicKeys = [
        'site_name',
        'site_description',
        'support_email',
        'contact_phone',
        'social_media_links',
        'maintenance_mode',
        'allow_registration',
        'default_course_language',
        'currency',
        'timezone',
        // Add other public settings as needed
      ];

      const settings = await this.platformSettingsRepository.findMany({
        ids: publicKeys,
      });

      // Convert to key-value pairs
      const settingsObject: Record<string, string> = {};
      settings.data.forEach((setting) => {
        settingsObject[setting.id] = setting.value;
      });

      return settingsObject;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch public settings');
    }
  }

  async getAdminSettings(): Promise<Record<string, string>> {
    try {
      // For admin, we might want all settings or a different set
      // For now, let's get all settings
      const settings = await this.platformSettingsRepository.findMany();

      // Convert to key-value pairs
      const settingsObject: Record<string, string> = {};
      settings.data.forEach((setting) => {
        settingsObject[setting.id] = setting.value;
      });

      return settingsObject;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch admin settings');
    }
  }

  async updateAdminSettings(
    updates: Record<string, string>,
    updatedBy: string,
  ): Promise<Record<string, string>> {
    try {
      // Define which settings can be updated via this endpoint
      const updatableKeys = [
        'site_name',
        'site_description',
        'support_email',
        'contact_phone',
        'social_media_links',
        'maintenance_mode',
        'allow_registration',
        'default_course_language',
        'currency',
        'timezone',
        // Add other updatable settings as needed
      ];

      // Validate that all keys in updates are allowed
      const invalidKeys = Object.keys(updates).filter(
        key => !updatableKeys.includes(key)
      );

      if (invalidKeys.length > 0) {
        throw new BadRequestException(`Cannot update settings: ${invalidKeys.join(', ')}`);
      }

      const updatePromises = Object.entries(updates).map(async ([key, value]) => {
        await this.platformSettingsRepository.update(key, {
          value,
          updatedBy,
        });
        return { [key]: value };
      });

      const results = await Promise.all(updatePromises);

      // Merge results into a single object
      const updatedSettings: Record<string, string> = {};
      results.forEach((result) => {
        Object.assign(updatedSettings, result);
      });

      return updatedSettings;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update admin settings');
    }
  }
}