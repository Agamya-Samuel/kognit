import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { submissions } from '../schema';
import { assignments } from '../schema/assignments';
import { lectures } from '../schema/lectures';
import { sections } from '../schema/sections';
import { courses } from '../schema/courses';
import { users } from '../schema/users';
import { eq, and, desc, count } from 'drizzle-orm';
import type { Submission } from '../schema';

@Injectable()
export class SubmissionsRepository extends BaseRepository<Submission> {
  constructor(db: any) {
    super(db, submissions);
  }

  async findById(id: number): Promise<Submission | null> {
    try {
      const result = await this.db
        .select()
        .from(submissions)
        .where(eq(submissions.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByAssignmentAndStudent(assignmentId: number, studentId: number): Promise<Submission | null> {
    try {
      const result = await this.db
        .select()
        .from(submissions)
        .where(and(eq(submissions.assignmentId, assignmentId), eq(submissions.studentId, studentId)))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByAssignmentAndStudent');
      return null;
    }
  }

  async findByAssignment(assignmentId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Submission>> {
    return this.findMany({ ...options, assignmentId });
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    assignmentId?: number;
    studentId?: number;
  } = {}): Promise<PaginatedResult<Submission>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.assignmentId) {
        conditions.push(eq(submissions.assignmentId, options.assignmentId));
      }
      if (options.studentId) {
        conditions.push(eq(submissions.studentId, options.studentId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(submissions)
          .where(whereClause)
          .orderBy(desc(submissions.submittedAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(submissions.id) }).from(submissions).where(whereClause),
      ]);
      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<Submission, 'id' | 'submittedAt'>): Promise<Submission> {
    try {
      const result = await this.db.insert(submissions).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<Submission, 'id' | 'submittedAt'>>): Promise<Submission | null> {
    try {
      const result = await this.db
        .update(submissions)
        .set(data)
        .where(eq(submissions.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async grade(id: number, score: number, feedback: string): Promise<Submission | null> {
    return this.update(id, { score, feedback, gradedAt: new Date() });
  }

  async count(filters?: { assignmentId?: number; studentId?: number }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.assignmentId) {
        conditions.push(eq(submissions.assignmentId, filters.assignmentId));
      }
      if (filters?.studentId) {
        conditions.push(eq(submissions.studentId, filters.studentId));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: count(submissions.id) }).from(submissions).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }

  async findRecentForInstructor(instructorId: number, limit: number = 10): Promise<Array<{
    id: number;
    studentName: string;
    assignmentTitle: string;
    courseTitle: string;
    submittedAt: Date;
  }>> {
    try {
      const result = await this.db
        .select({
          id: submissions.id,
          studentName: users.name,
          assignmentTitle: assignments.title,
          courseTitle: courses.title,
          submittedAt: submissions.submittedAt,
        })
        .from(submissions)
        .innerJoin(users, eq(submissions.studentId, users.id))
        .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
        .innerJoin(lectures, eq(assignments.lectureId, lectures.id))
        .innerJoin(sections, eq(lectures.sectionId, sections.id))
        .innerJoin(courses, eq(sections.courseId, courses.id))
        .where(eq(courses.instructorId, instructorId))
        .orderBy(desc(submissions.submittedAt))
        .limit(limit);

      return result;
    } catch (error) {
      this.handleError(error, 'findRecentForInstructor');
      return [];
    }
  }
}
