import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../db/repositories/base.repository';
import { platformSettings } from '../../db/schema/platform-settings';
import { eq, inArray, and } from 'drizzle-orm';
import type { PlatformSetting } from '../../db/schema/platform-settings';

@Injectable()
export class PlatformSettingsRepository extends BaseRepository<PlatformSetting> {
  constructor(db: any) {
    super(db, platformSettings);
  }

  async findById(id: string): Promise<PlatformSetting | null> {
    try {
      const result = await this.db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    ids?: string[];
  } = {}): Promise<{ data: PlatformSetting[]; total: number; limit: number; offset: number }> {
    const defaultLimit = 100;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;
      const ids = options.ids;

      const conditions = [];
      if (ids && ids.length > 0) {
        conditions.push(inArray(platformSettings.id, ids));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(platformSettings)
          .where(whereClause)
          .orderBy(platformSettings.updatedAt)
          .limit(limit)
          .offset(offset),
        this.db.select({ count: platformSettings.id }).from(platformSettings).where(whereClause),
      ]);

      return {
        data,
        total: totalResult.length,
        limit,
        offset,
      };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<PlatformSetting, 'id' | 'updatedAt'>): Promise<PlatformSetting> {
    try {
      const result = await this.db
        .insert(platformSettings)
        .values(data)
        .returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: string, data: Partial<Omit<PlatformSetting, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PlatformSetting | null> {
    try {
      const result = await this.db
        .update(platformSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(platformSettings.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db
        .delete(platformSettings)
        .where(eq(platformSettings.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }
}