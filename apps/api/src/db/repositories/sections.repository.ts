import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { sections } from '../schema';
import { eq, and, desc, asc, count, isNull } from 'drizzle-orm';
import type { Section } from '../schema';

@Injectable()
export class SectionsRepository extends BaseRepository<Section> {
  constructor(db: any) {
    super(db, sections);
  }

  async findById(id: number): Promise<Section | null> {
    try {
      const result = await this.db
        .select()
        .from(sections)
        .where(and(eq(sections.id, id), isNull(sections.deletedAt)))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByCourseId(courseId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Section>> {
    return this.findMany({ ...options, courseId });
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    courseId?: number;
  } = {}): Promise<PaginatedResult<Section>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [isNull(sections.deletedAt)];
      if (options.courseId) {
        conditions.push(eq(sections.courseId, options.courseId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(sections)
          .where(whereClause)
          .orderBy(asc(sections.orderIndex))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(sections.id) }).from(sections).where(whereClause),
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

  async create(sectionData: Omit<Section, 'id' | 'createdAt'>): Promise<Section> {
    try {
      const result = await this.db.insert(sections).values(sectionData).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, sectionData: Partial<Omit<Section, 'id' | 'createdAt'>>): Promise<Section | null> {
    try {
      const result = await this.db
        .update(sections)
        .set(sectionData)
        .where(eq(sections.id, id))
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
        .update(sections)
        .set({ deletedAt: new Date() })
        .where(eq(sections.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }

  /**
   * Soft-delete a section by setting `deleted_at`. All read methods filter
   * out soft-deleted rows via `isNull(sections.deletedAt)`.
   */
  async softDelete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .update(sections)
        .set({ deletedAt: new Date() })
        .where(eq(sections.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'softDelete');
      return false;
    }
  }

  async count(filters?: { courseId?: number }): Promise<number> {
    try {
      const conditions = [isNull(sections.deletedAt)];

      if (filters?.courseId) {
        conditions.push(eq(sections.courseId, filters.courseId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await this.db.select({ count: count(sections.id) }).from(sections).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
