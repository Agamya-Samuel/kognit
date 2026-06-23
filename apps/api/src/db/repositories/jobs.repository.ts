import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { jobs } from '../schema';
import { eq, and, desc, like, or, count } from 'drizzle-orm';
import type { Job } from '../schema';

@Injectable()
export class JobsRepository extends BaseRepository<Job> {
  constructor(db: any) {
    super(db, jobs);
  }

  async findById(id: number): Promise<Job | null> {
    try {
      const result = await this.db
        .select()
        .from(jobs)
        .where(eq(jobs.id, id))
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
    postedBy?: number;
    courseId?: number;
    domain?: string;
    isActive?: boolean;
    search?: string;
  } = {}): Promise<PaginatedResult<Job>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.postedBy) {
        conditions.push(eq(jobs.postedBy, options.postedBy));
      }
      if (options.courseId) {
        conditions.push(eq(jobs.courseId, options.courseId));
      }
      if (options.domain) {
        conditions.push(eq(jobs.domain, options.domain));
      }
      if (options.isActive !== undefined) {
        conditions.push(eq(jobs.isActive, options.isActive));
      }
      if (options.search) {
        conditions.push(
          or(
            like(jobs.title, `%${options.search}%`),
            like(jobs.company, `%${options.search}%`),
            like(jobs.description, `%${options.search}%`),
          ) as any,
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(jobs)
          .where(whereClause)
          .orderBy(desc(jobs.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(jobs.id) }).from(jobs).where(whereClause),
      ]);

      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    try {
      const result = await this.db.insert(jobs).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<Job, 'id' | 'createdAt'>>): Promise<Job | null> {
    try {
      const result = await this.db
        .update(jobs)
        .set(data)
        .where(eq(jobs.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async deactivate(id: number): Promise<Job | null> {
    return this.update(id, { isActive: false });
  }

  async findByDomain(domain: string, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Job>> {
    return this.findMany({ ...options, domain, isActive: true });
  }

  async findByCourse(courseId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Job>> {
    return this.findMany({ ...options, courseId });
  }

  async findByPoster(postedBy: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Job>> {
    return this.findMany({ ...options, postedBy });
  }

  async count(filters?: { postedBy?: number; courseId?: number; domain?: string; isActive?: boolean }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.postedBy) {
        conditions.push(eq(jobs.postedBy, filters.postedBy));
      }
      if (filters?.courseId) {
        conditions.push(eq(jobs.courseId, filters.courseId));
      }
      if (filters?.domain) {
        conditions.push(eq(jobs.domain, filters.domain));
      }
      if (filters?.isActive !== undefined) {
        conditions.push(eq(jobs.isActive, filters.isActive));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: count(jobs.id) }).from(jobs).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
