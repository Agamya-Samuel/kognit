import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { platformSettings } from '../schema';
import { eq } from 'drizzle-orm';
import type { PlatformSetting } from '../schema';

@Injectable()
export class SettingsRepository extends BaseRepository<PlatformSetting> {
  constructor(db: any) {
    super(db, platformSettings);
  }

  async getById(id: string) {
    try {
      const result = await this.db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'getById');
      return null;
    }
  }

  async getAll(): Promise<Array<{ id: string; value: string; description?: string }>> {
    try {
      const result = await this.db
        .select()
        .from(platformSettings);
      return result;
    } catch (error) {
      this.handleError(error, 'getAll');
      return [];
    }
  }

  async upsert(id: string, value: string, description?: string) {
    try {
      const result = await this.db
        .insert(platformSettings)
        .values({ id, value, description })
        .onConflictDoUpdate({ target: platformSettings.id, set: { value, updatedAt: new Date() } })
        .returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'upsert');
      throw error;
    }
  }
}