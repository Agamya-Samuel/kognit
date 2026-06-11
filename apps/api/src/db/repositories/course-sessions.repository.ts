import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { liveClasses } from '../schema';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';
import type { LiveClass } from '../schema';

@Injectable()
export class CourseSessionsRepository extends BaseRepository<LiveClass> {
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

  async findByCourseId(
    courseId: number,
    options: { offset?: number; limit?: number; status?: string } = {},
  ): Promise<PaginatedResult<LiveClass>> {
    const defaultLimit = 50;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [eq(liveClasses.courseId, courseId)];
      if (options.status) {
        conditions.push(eq(liveClasses.status, options.status as any));
      }

      const whereClause = and(...conditions);

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(liveClasses)
          .where(whereClause)
          .orderBy(desc(liveClasses.scheduledAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(liveClasses.id) }).from(liveClasses).where(whereClause),
      ]);

      return {
        data,
        total: totalResult[0]?.count ?? 0,
        limit,
        offset,
      };
    } catch (error) {
      this.handleError(error, 'findByCourseId');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async findUpcomingByCourse(courseId: number, limit: number = 20): Promise<LiveClass[]> {
    try {
      const conditions = [
        eq(liveClasses.courseId, courseId),
        gte(liveClasses.scheduledAt, new Date()),
        eq(liveClasses.status, 'scheduled' as any),
      ];

      const result = await this.db
        .select()
        .from(liveClasses)
        .where(and(...conditions))
        .orderBy(gte(liveClasses.scheduledAt, new Date()) as any)
        .limit(limit);
      return result;
    } catch (error) {
      this.handleError(error, 'findUpcomingByCourse');
      return [];
    }
  }

  async findByRecurringScheduleId(scheduleId: number): Promise<LiveClass[]> {
    try {
      const result = await this.db
        .select()
        .from(liveClasses)
        .where(eq(liveClasses.recurringScheduleId, scheduleId))
        .orderBy(desc(liveClasses.scheduledAt));
      return result;
    } catch (error) {
      this.handleError(error, 'findByRecurringScheduleId');
      return [];
    }
  }

  async create(data: Omit<LiveClass, 'id' | 'createdAt' | 'updatedAt'>): Promise<LiveClass> {
    try {
      const result = await this.db
        .insert(liveClasses)
        .values(data)
        .returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async createMany(data: Omit<LiveClass, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<LiveClass[]> {
    try {
      if (data.length === 0) return [];
      const result = await this.db
        .insert(liveClasses)
        .values(data)
        .returning();
      return result;
    } catch (error) {
      this.handleError(error, 'createMany');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<LiveClass, 'id' | 'createdAt' | 'updatedAt'>>): Promise<LiveClass | null> {
    try {
      const result = await this.db
        .update(liveClasses)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(liveClasses.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async cancel(id: number): Promise<LiveClass | null> {
    try {
      const result = await this.db
        .update(liveClasses)
        .set({ status: 'cancelled' as any, updatedAt: new Date() })
        .where(eq(liveClasses.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'cancel');
      return null;
    }
  }

  async cancelByRecurringSchedule(scheduleId: number): Promise<number> {
    try {
      // Cancel all future sessions for a recurring schedule
      const result = await this.db
        .update(liveClasses)
        .set({ status: 'cancelled' as any, updatedAt: new Date() })
        .where(
          and(
            eq(liveClasses.recurringScheduleId, scheduleId),
            eq(liveClasses.status, 'scheduled' as any),
            gte(liveClasses.scheduledAt, new Date()),
          ),
        )
        .returning();
      return result.length;
    } catch (error) {
      this.handleError(error, 'cancelByRecurringSchedule');
      return 0;
    }
  }

  async countByCourse(courseId: number, status?: string): Promise<number> {
    try {
      const conditions = [eq(liveClasses.courseId, courseId)];
      if (status) {
        conditions.push(eq(liveClasses.status, status as any));
      }
      const result = await this.db
        .select({ count: count(liveClasses.id) })
        .from(liveClasses)
        .where(and(...conditions));
      return result[0]?.count ?? 0;
    } catch (error) {
      this.handleError(error, 'countByCourse');
      return 0;
    }
  }

  async findByDateRange(
    courseId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<LiveClass[]> {
    try {
      const result = await this.db
        .select()
        .from(liveClasses)
        .where(
          and(
            eq(liveClasses.courseId, courseId),
            gte(liveClasses.scheduledAt, startDate),
            lte(liveClasses.scheduledAt, endDate),
          ),
        )
        .orderBy(desc(liveClasses.scheduledAt));
      return result;
    } catch (error) {
      this.handleError(error, 'findByDateRange');
      return [];
    }
  }
}
