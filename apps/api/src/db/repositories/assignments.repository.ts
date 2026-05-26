import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { assignments, lectures, sections, courses } from '../schema';
import { eq, and, desc, like, or, sql } from 'drizzle-orm';
import type { Assignment } from '../schema';

@Injectable()
export class AssignmentsRepository extends BaseRepository<Assignment> {
  constructor(db: any) {
    super(db, assignments);
  }

  async findById(id: number): Promise<Assignment | null> {
    try {
      const result = await this.db
        .select()
        .from(assignments)
        .where(eq(assignments.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByLectureId(lectureId: number): Promise<Assignment | null> {
    try {
      const result = await this.db
        .select()
        .from(assignments)
        .where(eq(assignments.lectureId, lectureId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByLectureId');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    lectureId?: number;
    type?: string;
  } = {}): Promise<PaginatedResult<Assignment>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.lectureId) {
        conditions.push(eq(assignments.lectureId, options.lectureId));
      }
      if (options.type) {
        conditions.push(eq(assignments.type, options.type as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(assignments)
          .where(whereClause)
          .orderBy(desc(assignments.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: assignments.id }).from(assignments).where(whereClause),
      ]);
      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async findManyWithCourseName(options: {
    offset?: number;
    limit?: number;
    search?: string;
    status?: string;
  } = {}): Promise<PaginatedResult<any>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const [data, totalResult] = await this.db
        .select({
          id: assignments.id,
          title: assignments.title,
          description: assignments.description,
          type: assignments.type,
          maxScore: assignments.maxScore,
          dueAt: assignments.dueAt,
          createdAt: assignments.createdAt,
          courseId: sections.courseId,
          courseName: courses.title,
        })
        .from(assignments)
        .innerJoin(lectures, eq(assignments.lectureId, lectures.id))
        .innerJoin(sections, eq(lectures.sectionId, sections.id))
        .innerJoin(courses, eq(sections.courseId, courses.id))
        .orderBy(desc(assignments.createdAt))
        .limit(limit)
        .offset(offset);

      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findManyWithCourseName');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> {
    try {
      const result = await this.db.insert(assignments).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<Assignment, 'id' | 'createdAt'>>): Promise<Assignment | null> {
    try {
      const result = await this.db
        .update(assignments)
        .set(data)
        .where(eq(assignments.id, id))
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
        .delete(assignments)
        .where(eq(assignments.id, id))
        .returning();
      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'delete');
      return false;
    }
  }
}