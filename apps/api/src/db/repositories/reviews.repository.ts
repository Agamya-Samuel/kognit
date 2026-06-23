import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { reviews } from '../schema';
import { eq, and, desc, avg, count, sql, isNull } from 'drizzle-orm';
import type { Review } from '../schema';

@Injectable()
export class ReviewsRepository extends BaseRepository<Review> {
  constructor(db: any) {
    super(db, reviews);
  }

  async findById(id: number): Promise<Review | null> {
    try {
      const result = await this.db
        .select()
        .from(reviews)
        .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByUserAndCourse(userId: number, courseId: number): Promise<Review | null> {
    try {
      const result = await this.db
        .select()
        .from(reviews)
        .where(
          and(
            eq(reviews.userId, userId),
            eq(reviews.courseId, courseId),
            isNull(reviews.deletedAt),
          ),
        )
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByUserAndCourse');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    courseId?: number;
    userId?: number;
    moderationStatus?: string;
  } = {}): Promise<PaginatedResult<Review>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [isNull(reviews.deletedAt)];
      if (options.courseId) {
        conditions.push(eq(reviews.courseId, options.courseId));
      }
      if (options.userId) {
        conditions.push(eq(reviews.userId, options.userId));
      }
      if (options.moderationStatus) {
        conditions.push(eq(reviews.moderationStatus, options.moderationStatus as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(reviews)
          .where(whereClause)
          .orderBy(desc(reviews.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(reviews.id) }).from(reviews).where(whereClause),
      ]);

      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    try {
      const result = await this.db.insert(reviews).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<Review, 'id' | 'createdAt'>>): Promise<Review | null> {
    try {
      const result = await this.db
        .update(reviews)
        .set(data)
        .where(eq(reviews.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async moderate(id: number, moderationStatus: string, moderatedBy: number): Promise<Review | null> {
    try {
      const updateData: Partial<Review> = {
        moderationStatus: moderationStatus as any,
        moderatedBy,
      };

      if (moderationStatus === 'flagged') {
        updateData.flaggedAt = new Date();
        updateData.moderatedAt = new Date();
      }

      const result = await this.db
        .update(reviews)
        .set(updateData)
        .where(and(eq(reviews.id, id), isNull(reviews.deletedAt)))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'moderate');
      return null;
    }
  }

  async findByCourse(courseId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Review>> {
    return this.findMany({ ...options, courseId });
  }

  async findByUser(userId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Review>> {
    return this.findMany({ ...options, userId });
  }

  async getCourseAverageRating(courseId: number): Promise<{ average: number; count: number } | null> {
    try {
      const result = await this.db
        .select({
          average: avg(reviews.rating),
          count: count(reviews.id),
        })
        .from(reviews)
        .where(
          and(
            eq(reviews.courseId, courseId),
            eq(reviews.moderationStatus, 'visible'),
            isNull(reviews.deletedAt),
          ),
        );

      const row = result[0];
      if (!row || row.count === 0) return null;
      return { average: Number(row.average), count: Number(row.count) };
    } catch (error) {
      this.handleError(error, 'getCourseAverageRating');
      return null;
    }
  }

  async count(filters?: { courseId?: number; userId?: number; moderationStatus?: string }): Promise<number> {
    try {
      const conditions = [isNull(reviews.deletedAt)];
      if (filters?.courseId) {
        conditions.push(eq(reviews.courseId, filters.courseId));
      }
      if (filters?.userId) {
        conditions.push(eq(reviews.userId, filters.userId));
      }
      if (filters?.moderationStatus) {
        conditions.push(eq(reviews.moderationStatus, filters.moderationStatus as any));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: count(reviews.id) }).from(reviews).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }

  /**
   * Soft-delete a review by setting `deleted_at`. The row remains in the DB
   * for audit / undelete purposes; all read methods filter it out via
   * `isNull(reviews.deletedAt)`.
   */
  async softDelete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .update(reviews)
        .set({ deletedAt: new Date() })
        .where(eq(reviews.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'softDelete');
      return false;
    }
  }
}
