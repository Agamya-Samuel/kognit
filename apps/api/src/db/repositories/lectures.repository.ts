import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { lectures } from '../schema';
import { eq, and, desc, asc } from 'drizzle-orm';
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
        .where(eq(lectures.id, id))
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

      const conditions = [];
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
        this.db.select({ count: lectures.id }).from(lectures).where(whereClause),
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
        .delete(lectures)
        .where(eq(lectures.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }

  async count(filters?: { sectionId?: number; type?: string; isPublished?: boolean }): Promise<number> {
    try {
      const conditions = [];

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

      const result = await this.db.select({ count: lectures.id }).from(lectures).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
