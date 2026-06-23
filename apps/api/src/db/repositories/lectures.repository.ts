import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { lectures } from '../schema';
import { eq, and, desc, asc, count, isNull } from 'drizzle-orm';
import type { Lecture } from '../schema';

@Injectable()
export class LecturesRepository extends BaseRepository<Lecture> {
  constructor(db: any) {
    super(db, lectures);
  }

  async findById(id: number): Promise<Lecture | null> {
    try {
      const result = await this.db
        .select()
        .from(lectures)
        .where(and(eq(lectures.id, id), isNull(lectures.deletedAt)))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findBySectionId(sectionId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Lecture>> {
    return this.findMany({ ...options, sectionId });
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    sectionId?: number;
    type?: string;
    isPublished?: boolean;
  } = {}): Promise<PaginatedResult<Lecture>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [isNull(lectures.deletedAt)];
      if (options.sectionId) {
        conditions.push(eq(lectures.sectionId, options.sectionId));
      }
      if (options.type) {
        conditions.push(eq(lectures.type, options.type as any));
      }
      if (options.isPublished !== undefined) {
        conditions.push(eq(lectures.isPublished, options.isPublished));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(lectures)
          .where(whereClause)
          .orderBy(asc(lectures.orderIndex))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(lectures.id) }).from(lectures).where(whereClause),
      ]);

      return {
        data,
        total: Number(totalResult[0]?.count ?? 0),
        limit,
        offset,
      };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(lectureData: Omit<Lecture, 'id' | 'createdAt'>): Promise<Lecture> {
    try {
      const result = await this.db.insert(lectures).values(lectureData).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, lectureData: Partial<Omit<Lecture, 'id' | 'createdAt'>>): Promise<Lecture | null> {
    try {
      const result = await this.db
        .update(lectures)
        .set(lectureData)
        .where(eq(lectures.id, id))
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
        .update(lectures)
        .set({ deletedAt: new Date() })
        .where(eq(lectures.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }

  /**
   * Soft-delete a lecture by setting `deleted_at`.
   */
  async softDelete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .update(lectures)
        .set({ deletedAt: new Date() })
        .where(eq(lectures.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'softDelete');
      return false;
    }
  }

  async count(filters?: { sectionId?: number; type?: string; isPublished?: boolean }): Promise<number> {
    try {
      const conditions = [isNull(lectures.deletedAt)];

      if (filters?.sectionId) {
        conditions.push(eq(lectures.sectionId, filters.sectionId));
      }
      if (filters?.type) {
        conditions.push(eq(lectures.type, filters.type as any));
      }
      if (filters?.isPublished !== undefined) {
        conditions.push(eq(lectures.isPublished, filters.isPublished));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await this.db.select({ count: count(lectures.id) }).from(lectures).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }

  async findByMuxAssetId(muxAssetId: string): Promise<Lecture | null> {
    try {
      const result = await this.db
        .select()
        .from(lectures)
        .where(and(eq(lectures.muxAssetId, muxAssetId), isNull(lectures.deletedAt)))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByMuxAssetId');
      return null;
    }
  }
}
