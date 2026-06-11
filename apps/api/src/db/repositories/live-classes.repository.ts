import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { liveClasses } from '../schema';
import { eq, and, desc, gte, lte, sql, count } from 'drizzle-orm';
import type { LiveClass } from '../schema';
import { users } from '../schema/users';
import { courses } from '../schema/courses';

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

  async findByCourseId(courseId: number): Promise<LiveClass[]> {
    try {
      const result = await this.db
        .select()
        .from(liveClasses)
        .where(eq(liveClasses.courseId, courseId))
        .orderBy(desc(liveClasses.scheduledAt));
      return result;
    } catch (error) {
      this.handleError(error, 'findByCourseId');
      return [];
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
    courseId?: number;
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
      if (options.courseId) {
        conditions.push(eq(liveClasses.courseId, options.courseId));
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
        this.db.select({ count: count(liveClasses.id) }).from(liveClasses).where(whereClause),
      ]);

      return { data, total: totalResult[0]?.count ?? 0, limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<LiveClass, 'id' | 'createdAt' | 'updatedAt'>): Promise<LiveClass> {
    try {
      const result = await this.db.insert(liveClasses).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
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

  async count(filters?: { instructorId?: number; status?: string; courseId?: number }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.instructorId) {
        conditions.push(eq(liveClasses.instructorId, filters.instructorId));
      }
      if (filters?.status) {
        conditions.push(eq(liveClasses.status, filters.status as any));
      }
      if (filters?.courseId) {
        conditions.push(eq(liveClasses.courseId, filters.courseId));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: count(liveClasses.id) }).from(liveClasses).where(whereClause);
      return result[0]?.count ?? 0;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options: { instructorId?: number } = {},
  ): Promise<LiveClass[]> {
    try {
      const conditions = [
        gte(liveClasses.scheduledAt, startDate),
        lte(liveClasses.scheduledAt, endDate),
      ];
      if (options.instructorId) {
        conditions.push(eq(liveClasses.instructorId, options.instructorId));
      }

      const result = await this.db
        .select()
        .from(liveClasses)
        .where(and(...conditions))
        .orderBy(liveClasses.scheduledAt);
      return result;
    } catch (error) {
      this.handleError(error, 'findByDateRange');
      return [];
    }
  }

  async findUpcoming(options: {
    instructorId?: number;
    limit?: number;
  } = {}): Promise<LiveClass[]> {
    try {
      const conditions = [
        gte(liveClasses.scheduledAt, new Date()),
        eq(liveClasses.status, 'scheduled' as any),
      ];
      if (options.instructorId) {
        conditions.push(eq(liveClasses.instructorId, options.instructorId));
      }

      const result = await this.db
        .select()
        .from(liveClasses)
        .where(and(...conditions))
        .orderBy(liveClasses.scheduledAt)
        .limit(options.limit ?? 10);
      return result;
    } catch (error) {
      this.handleError(error, 'findUpcoming');
      return [];
    }
  }

  async findByRecordingStatus(status: string): Promise<LiveClass[]> {
    try {
      const result = await this.db
        .select()
        .from(liveClasses)
        .where(eq(liveClasses.recordingStatus, status as any));
      return result;
    } catch (error) {
      this.handleError(error, 'findByRecordingStatus');
      return [];
    }
  }

  // Dashboard metrics
  async countUpcomingForInstructor(instructorId: number): Promise<number> {
    try {
      const result = await this.db
        .select({ count: count(liveClasses.id) })
        .from(liveClasses)
        .where(
          and(
            eq(liveClasses.instructorId, instructorId),
            gte(liveClasses.scheduledAt, new Date()),
            eq(liveClasses.status, 'scheduled' as any),
          ),
        );
      return result[0]?.count ?? 0;
    } catch (error) {
      this.handleError(error, 'countUpcomingForInstructor');
      return 0;
    }
  }

  async findRecentForInstructor(instructorId: number, limit: number = 10): Promise<Array<{
    id: number;
    scheduledAt: Date;
    title: string;
    instructorName: string;
    courseTitle: string;
  }>> {
    try {
      const result = await this.db
        .select({
          id: liveClasses.id,
          scheduledAt: liveClasses.scheduledAt,
          title: liveClasses.title,
          instructorName: users.name,
          courseTitle: courses.title,
        })
        .from(liveClasses)
        .innerJoin(users, eq(liveClasses.instructorId, users.id))
        .innerJoin(courses, eq(liveClasses.courseId, courses.id))
        .where(eq(liveClasses.instructorId, instructorId))
        .orderBy(desc(liveClasses.scheduledAt))
        .limit(limit);

      return result;
    } catch (error) {
      this.handleError(error, 'findRecentForInstructor');
      return [];
    }
  }
}
