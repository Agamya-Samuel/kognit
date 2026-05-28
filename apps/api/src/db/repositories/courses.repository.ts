import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { courses } from '../schema';
import { eq, and, desc, like, or, not } from 'drizzle-orm';
import type { Course } from '../schema';

@Injectable()
export class CoursesRepository extends BaseRepository<Course> {
  constructor(db: any) {
    super(db, courses);
  }

  async findById(id: number): Promise<Course | null> {
    try {
      const result = await this.db
        .select()
        .from(courses)
        .where(and(eq(courses.id, id), eq(courses.deletedAt, null as any)))
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
    instructorId?: number;
    isPublished?: boolean;
    domain?: string;
    search?: string;
  } = {}): Promise<PaginatedResult<Course>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [eq(courses.deletedAt, null as any)];

      if (options.instructorId) {
        conditions.push(eq(courses.instructorId, options.instructorId));
      }

      if (options.isPublished !== undefined) {
        conditions.push(eq(courses.isPublished, options.isPublished));
      }

      if (options.domain) {
        conditions.push(eq(courses.domain, options.domain));
      }

      if (options.search) {
        conditions.push(
          or(
            like(courses.title, `%${options.search}%`),
            like(courses.description, `%${options.search}%`),
          ) as any,
        );
      }

      const whereClause = and(...conditions);

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(courses)
          .where(whereClause)
          .orderBy(desc(courses.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: courses.id }).from(courses).where(whereClause),
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

  async create(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Promise<Course> {
    try {
      const result = await this.db.insert(courses).values(courseData).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, courseData: Partial<Omit<Course, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Course | null> {
    try {
      const result = await this.db
        .update(courses)
        .set({ ...courseData, updatedAt: new Date() })
        .where(and(eq(courses.id, id), eq(courses.deletedAt, null as any)))
        .returning();

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async softDelete(id: number): Promise<boolean> {
    try {
      const result = await this.db
        .update(courses)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(courses.id, id), eq(courses.deletedAt, null as any)))
        .returning();

      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'softDelete');
      return false;
    }
  }

  async findByInstructor(instructorId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Course>> {
    return this.findMany({ ...options, instructorId });
  }

   async count(filters?: { instructorId?: number; isPublished?: boolean; domain?: string; deletedAt?: any }): Promise<number> {
     try {
       const conditions = [];

       // Only add deletedAt condition if filters.specifically asks for it
       // By default, we count non-deleted records (deletedAt IS NULL)
       if (filters?.deletedAt === null) {
         // Explicitly asking for non-deleted
         conditions.push(eq(courses.deletedAt, null as any));
       } else if (filters?.deletedAt !== undefined && filters.deletedAt !== null) {
         // Explicitly asking for deleted records (deletedAt IS NOT NULL)
         conditions.push(not(eq(courses.deletedAt, null as any)));
       } else {
         // Default case: count non-deleted records
         conditions.push(eq(courses.deletedAt, null as any));
       }

       if (filters?.instructorId) {
         conditions.push(eq(courses.instructorId, filters.instructorId));
       }

       if (filters?.isPublished !== undefined) {
         conditions.push(eq(courses.isPublished, filters.isPublished));
       }

       if (filters?.domain) {
         conditions.push(eq(courses.domain, filters.domain));
       }

       const whereClause = and(...conditions);

       const result = await this.db.select({ count: courses.id }).from(courses).where(whereClause);
       return result.length;
     } catch (error) {
       this.handleError(error, 'count');
       return 0;
     }
   }
}
