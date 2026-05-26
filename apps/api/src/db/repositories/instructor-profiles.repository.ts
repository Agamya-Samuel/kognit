import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { instructorProfiles } from '../schema';
import { eq, and, desc } from 'drizzle-orm';
import type { InstructorProfile } from '../schema';

@Injectable()
export class InstructorProfilesRepository extends BaseRepository<InstructorProfile> {
  constructor(db: any) {
    super(db, instructorProfiles);
  }

  async findById(id: number): Promise<InstructorProfile | null> {
    try {
      const result = await this.db
        .select()
        .from(instructorProfiles)
        .where(eq(instructorProfiles.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByUserId(userId: number): Promise<InstructorProfile | null> {
    try {
      const result = await this.db
        .select()
        .from(instructorProfiles)
        .where(eq(instructorProfiles.userId, userId))
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
    approvalStatus?: string;
  } = {}): Promise<PaginatedResult<InstructorProfile>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.approvalStatus) {
        conditions.push(eq(instructorProfiles.approvalStatus, options.approvalStatus as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(instructorProfiles)
          .where(whereClause)
          .orderBy(desc(instructorProfiles.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: instructorProfiles.id }).from(instructorProfiles).where(whereClause),
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

  async create(profileData: Omit<InstructorProfile, 'id' | 'createdAt'>): Promise<InstructorProfile> {
    try {
      const result = await this.db.insert(instructorProfiles).values(profileData).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, profileData: Partial<Omit<InstructorProfile, 'id' | 'createdAt'>>): Promise<InstructorProfile | null> {
    try {
      const result = await this.db
        .update(instructorProfiles)
        .set(profileData)
        .where(eq(instructorProfiles.id, id))
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
        .delete(instructorProfiles)
        .where(eq(instructorProfiles.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }

  async countAllApproved(): Promise<number> {
    try {
      const result = await this.db
        .select({ count: instructorProfiles.id })
        .from(instructorProfiles)
        .where(eq(instructorProfiles.approvalStatus, 'approved'));
      return result.length;
    } catch (error) {
      this.handleError(error, 'countAllApproved');
      return 0;
    }
  }

  async countAllPending(): Promise<number> {
    try {
      const result = await this.db
        .select({ count: instructorProfiles.id })
        .from(instructorProfiles)
        .where(eq(instructorProfiles.approvalStatus, 'pending'));
      return result.length;
    } catch (error) {
      this.handleError(error, 'countAllPending');
      return 0;
    }
  }
}