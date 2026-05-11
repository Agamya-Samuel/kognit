import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { liveClasses } from '../schema';
import { eq, and, desc } from 'drizzle-orm';
import type { LiveClass } from '../schema';

@Injectable()
export class LiveClassesRepository extends BaseRepository<LiveClass> {
  constructor(db: any) {
    super(db, liveClasses);
  }

  async findById(id: number): Promise<LiveClass | null> {
    try {
      const result = await this.db
        .select()
        .from(liveClasses)
        .where(eq(liveClasses.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByLectureId(lectureId: number): Promise<LiveClass | null> {
    try {
      const result = await this.db
        .select()
        .from(liveClasses)
        .where(eq(liveClasses.lectureId, lectureId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByLectureId');
      return null;
    }
  }

  async findByInstructorId(instructorId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<LiveClass>> {
    return this.findMany({ ...options, instructorId });
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    instructorId?: number;
    status?: string;
  } = {}): Promise<PaginatedResult<LiveClass>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.instructorId) {
        conditions.push(eq(liveClasses.instructorId, options.instructorId));
      }
      if (options.status) {
        conditions.push(eq(liveClasses.status, options.status as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(liveClasses)
          .where(whereClause)
          .orderBy(desc(liveClasses.scheduledAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: liveClasses.id }).from(liveClasses).where(whereClause),
      ]);
      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<LiveClass, 'id' | 'createdAt'>): Promise<LiveClass> {
    try {
      const result = await this.db.insert(liveClasses).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<LiveClass, 'id' | 'createdAt'>>): Promise<LiveClass | null> {
    try {
      const result = await this.db
        .update(liveClasses)
        .set(data)
        .where(eq(liveClasses.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async count(filters?: { instructorId?: number; status?: string }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.instructorId) {
        conditions.push(eq(liveClasses.instructorId, filters.instructorId));
      }
      if (filters?.status) {
        conditions.push(eq(liveClasses.status, filters.status as any));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: liveClasses.id }).from(liveClasses).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
