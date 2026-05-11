import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { adminProfiles } from '../schema';
import { eq, desc } from 'drizzle-orm';
import type { AdminProfile } from '../schema';

@Injectable()
export class AdminProfilesRepository extends BaseRepository<AdminProfile> {
  constructor(db: any) {
    super(db, adminProfiles);
  }

  async findById(id: number): Promise<AdminProfile | null> {
    try {
      const result = await this.db
        .select()
        .from(adminProfiles)
        .where(eq(adminProfiles.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByUserId(userId: number): Promise<AdminProfile | null> {
    try {
      const result = await this.db
        .select()
        .from(adminProfiles)
        .where(eq(adminProfiles.userId, userId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByUserId');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    permissionsLevel?: string;
  } = {}): Promise<PaginatedResult<AdminProfile>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.permissionsLevel) {
        conditions.push(eq(adminProfiles.permissionsLevel, options.permissionsLevel as any));
      }

      const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : undefined) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(adminProfiles)
          .where(whereClause)
          .orderBy(desc(adminProfiles.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: adminProfiles.id }).from(adminProfiles).where(whereClause),
      ]);
      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(profileData: Omit<AdminProfile, 'id' | 'createdAt'>): Promise<AdminProfile> {
    try {
      const result = await this.db.insert(adminProfiles).values(profileData).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, profileData: Partial<Omit<AdminProfile, 'id' | 'createdAt'>>): Promise<AdminProfile | null> {
    try {
      const result = await this.db
        .update(adminProfiles)
        .set(profileData)
        .where(eq(adminProfiles.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .delete(adminProfiles)
        .where(eq(adminProfiles.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }
}
