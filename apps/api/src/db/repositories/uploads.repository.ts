import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { uploads } from '../schema';
import { eq, and, desc, or } from 'drizzle-orm';
import type { Upload } from '../schema';

@Injectable()
export class UploadsRepository extends BaseRepository<Upload> {
  constructor(db: any) {
    super(db, uploads);
  }

  async findById(id: number): Promise<Upload | null> {
    try {
      const result = await this.db
        .select()
        .from(uploads)
        .where(eq(uploads.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByLectureId(lectureId: number): Promise<Upload | null> {
    try {
      const result = await this.db
        .select()
        .from(uploads)
        .where(eq(uploads.lectureId, lectureId))
        .orderBy(desc(uploads.createdAt))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByLectureId');
      return null;
    }
  }

  async findActiveUploadsForUser(userId: number): Promise<Upload[]> {
    try {
      const result = await this.db
        .select()
        .from(uploads)
        .where(
          and(
            eq(uploads.userId, userId),
            or(
              eq(uploads.status, 'pending'),
              eq(uploads.status, 'uploading')
            )
          )
        )
        .orderBy(desc(uploads.createdAt));

      return result;
    } catch (error) {
      this.handleError(error, 'findActiveUploadsForUser');
      return [];
    }
  }

  async findByUser(userId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Upload>> {
    return this.findMany({ ...options, userId });
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    userId?: number;
    lectureId?: number;
    status?: string;
  } = {}): Promise<PaginatedResult<Upload>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.userId) {
        conditions.push(eq(uploads.userId, options.userId));
      }
      if (options.lectureId) {
        conditions.push(eq(uploads.lectureId, options.lectureId));
      }
      if (options.status) {
        conditions.push(eq(uploads.status, options.status as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(uploads)
          .where(whereClause)
          .orderBy(desc(uploads.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: uploads.id }).from(uploads).where(whereClause),
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

  async create(uploadData: Omit<Upload, 'id' | 'createdAt' | 'updatedAt'>): Promise<Upload> {
    try {
      const result = await this.db.insert(uploads).values(uploadData).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, uploadData: Partial<Omit<Upload, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Upload | null> {
    try {
      const result = await this.db
        .update(uploads)
        .set({ ...uploadData, updatedAt: new Date() })
        .where(eq(uploads.id, id))
        .returning();

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async updateStatus(id: number, status: string, additionalData: { errorMessage?: string; uploadedAt?: Date } = {}): Promise<Upload | null> {
    return this.update(id, { 
      status: status as any,
      ...additionalData 
    });
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .delete(uploads)
        .where(eq(uploads.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }

  async count(filters?: { userId?: number; lectureId?: number; status?: string }): Promise<number> {
    try {
      const conditions = [];

      if (filters?.userId) {
        conditions.push(eq(uploads.userId, filters.userId));
      }
      if (filters?.lectureId) {
        conditions.push(eq(uploads.lectureId, filters.lectureId));
      }
      if (filters?.status) {
        conditions.push(eq(uploads.status, filters.status as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await this.db.select({ count: uploads.id }).from(uploads).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
