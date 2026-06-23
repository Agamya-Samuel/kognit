import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { institutionEnrollments } from '../schema';
import { eq, and, desc, count } from 'drizzle-orm';
import type { InstitutionEnrollment } from '../schema';

@Injectable()
export class InstitutionEnrollmentsRepository extends BaseRepository<InstitutionEnrollment> {
  constructor(db: any) {
    super(db, institutionEnrollments);
  }

  async findById(id: number): Promise<InstitutionEnrollment | null> {
    try {
      const result = await this.db
        .select()
        .from(institutionEnrollments)
        .where(eq(institutionEnrollments.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByInstitutionStudentCourse(
    institutionAccountId: number,
    studentId: number,
    courseId: number,
  ): Promise<InstitutionEnrollment | null> {
    try {
      const result = await this.db
        .select()
        .from(institutionEnrollments)
        .where(
          and(
            eq(institutionEnrollments.institutionAccountId, institutionAccountId),
            eq(institutionEnrollments.studentId, studentId),
            eq(institutionEnrollments.courseId, courseId),
          ),
        )
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByInstitutionStudentCourse');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    institutionAccountId?: number;
    studentId?: number;
    courseId?: number;
  } = {}): Promise<PaginatedResult<InstitutionEnrollment>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.institutionAccountId) {
        conditions.push(eq(institutionEnrollments.institutionAccountId, options.institutionAccountId));
      }
      if (options.studentId) {
        conditions.push(eq(institutionEnrollments.studentId, options.studentId));
      }
      if (options.courseId) {
        conditions.push(eq(institutionEnrollments.courseId, options.courseId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(institutionEnrollments)
          .where(whereClause)
          .orderBy(desc(institutionEnrollments.enrolledAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(institutionEnrollments.id) }).from(institutionEnrollments).where(whereClause),
      ]);

      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<InstitutionEnrollment, 'id' | 'enrolledAt'>): Promise<InstitutionEnrollment> {
    try {
      const result = await this.db.insert(institutionEnrollments).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async findByInstitution(institutionAccountId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<InstitutionEnrollment>> {
    return this.findMany({ ...options, institutionAccountId });
  }

  async findByStudent(studentId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<InstitutionEnrollment>> {
    return this.findMany({ ...options, studentId });
  }

  async findByCourse(courseId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<InstitutionEnrollment>> {
    return this.findMany({ ...options, courseId });
  }

  async count(filters?: { institutionAccountId?: number; studentId?: number; courseId?: number }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.institutionAccountId) {
        conditions.push(eq(institutionEnrollments.institutionAccountId, filters.institutionAccountId));
      }
      if (filters?.studentId) {
        conditions.push(eq(institutionEnrollments.studentId, filters.studentId));
      }
      if (filters?.courseId) {
        conditions.push(eq(institutionEnrollments.courseId, filters.courseId));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: count(institutionEnrollments.id) }).from(institutionEnrollments).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
