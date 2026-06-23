import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { channels } from '../schema';
import { eq, and, desc, count } from 'drizzle-orm';
import type { Channel } from '../schema';

@Injectable()
export class ChannelsRepository extends BaseRepository<Channel> {
  constructor(db: any) {
    super(db, channels);
  }

  async findById(id: number): Promise<Channel | null> {
    try {
      const result = await this.db
        .select()
        .from(channels)
        .where(eq(channels.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    courseId?: number;
    type?: string;
  } = {}): Promise<PaginatedResult<Channel>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.courseId) {
        conditions.push(eq(channels.courseId, options.courseId));
      }
      if (options.type) {
        conditions.push(eq(channels.type, options.type as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(channels)
          .where(whereClause)
          .orderBy(desc(channels.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(channels.id) }).from(channels).where(whereClause),
      ]);

      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<Channel, 'id' | 'createdAt'>): Promise<Channel> {
    try {
      const result = await this.db.insert(channels).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async findByCourse(courseId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Channel>> {
    return this.findMany({ ...options, courseId });
  }

  async count(filters?: { courseId?: number; type?: string }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.courseId) {
        conditions.push(eq(channels.courseId, filters.courseId));
      }
      if (filters?.type) {
        conditions.push(eq(channels.type, filters.type as any));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: count(channels.id) }).from(channels).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }

  async update(id: number, data: Partial<Pick<Channel, 'name'>>): Promise<Channel | null> {
    try {
      const result = await this.db
        .update(channels)
        .set(data)
        .where(eq(channels.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }
}
