import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { enrollments } from '../schema';
import { eq, and, desc, inArray } from 'drizzle-orm';
import type { Enrollment } from '../schema';
import { users } from '../schema/users';
import { courses } from '../schema/courses';

@Injectable()
export class EnrollmentsRepository extends BaseRepository<Enrollment> {
  constructor(db: any) {
    super(db, enrollments);
  }

  async findById(id: number): Promise<Enrollment | null> {
    try {
      const result = await this.db
        .select()
        .from(enrollments)
        .where(eq(enrollments.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByStudentAndCourse(studentId: number, courseId: number): Promise<Enrollment | null> {
    try {
      const result = await this.db
        .select()
        .from(enrollments)
        .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByStudentAndCourse');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    studentId?: number;
    courseId?: number;
  } = {}): Promise<PaginatedResult<Enrollment>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];

      if (options.studentId) {
        conditions.push(eq(enrollments.studentId, options.studentId));
      }

      if (options.courseId) {
        conditions.push(eq(enrollments.courseId, options.courseId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(enrollments)
          .where(whereClause)
          .orderBy(desc(enrollments.enrolledAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: enrollments.id }).from(enrollments).where(whereClause),
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

  async create(enrollmentData: Omit<Enrollment, 'id'>): Promise<Enrollment> {
    try {
      const result = await this.db.insert(enrollments).values(enrollmentData).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async findByStudent(studentId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Enrollment>> {
    return this.findMany({ ...options, studentId });
  }

  async findByCourse(courseId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Enrollment>> {
    return this.findMany({ ...options, courseId });
  }

  async count(filters?: { studentId?: number; courseId?: number }): Promise<number> {
    try {
      const conditions = [];

      if (filters?.studentId) {
        conditions.push(eq(enrollments.studentId, filters.studentId));
      }

      if (filters?.courseId) {
        conditions.push(eq(enrollments.courseId, filters.courseId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await this.db.select({ count: enrollments.id }).from(enrollments).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }

  async checkEnrollmentExists(studentId: number, courseId: number): Promise<boolean> {
    const enrollment = await this.findByStudentAndCourse(studentId, courseId);
    return enrollment !== null;
  }

  // New methods for dashboard metrics
  async findRecentForInstructor(instructorId: number, limit: number = 10): Promise<Array<{
    id: number;
    enrolledAt: Date;
    studentName: string;
    courseTitle: string;
  }>> {
    try {
      const result = await this.db
        .select({
          id: enrollments.id,
          enrolledAt: enrollments.enrolledAt,
          studentName: users.name,
          courseTitle: courses.title,
        })
        .from(enrollments)
        .innerJoin(users, eq(enrollments.studentId, users.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(eq(courses.instructorId, instructorId))
        .orderBy(desc(enrollments.enrolledAt))
        .limit(limit);

      return result;
    } catch (error) {
      this.handleError(error, 'findRecentForInstructor');
      return [];
    }
  }

  async countByCourseIds(courseIds: number[]): Promise<number> {
    if (courseIds.length === 0) return 0;
    
    try {
      const result = await this.db
        .select({ count: enrollments.id })
        .from(enrollments)
        .where(inArray(enrollments.courseId, courseIds));
      
      return result.length;
    } catch (error) {
      this.handleError(error, 'countByCourseIds');
      return 0;
    }
  }

  // New method for instructor students service
  async findByCoursesWithDetails(courseIds: number[]): Promise<Array<{
    id: number;
    studentId: number;
    courseId: number;
    enrolledAt: Date;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
  }>> {
    if (courseIds.length === 0) return [];
    
    try {
      const result = await this.db
        .select({
          id: enrollments.id,
          studentId: enrollments.studentId,
          courseId: enrollments.courseId,
          enrolledAt: enrollments.enrolledAt,
          studentName: users.name,
          studentEmail: users.email,
          courseTitle: courses.title,
        })
        .from(enrollments)
        .innerJoin(users, eq(enrollments.studentId, users.id))
        .innerJoin(courses, eq(enrollments.courseId, courses.id))
        .where(inArray(enrollments.courseId, courseIds))
        .orderBy(desc(enrollments.enrolledAt));

      return result;
    } catch (error) {
      this.handleError(error, 'findByCoursesWithDetails');
      return [];
    }
  }
}
