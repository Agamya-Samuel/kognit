import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { certificates } from '../schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Certificate } from '../schema';

@Injectable()
export class CertificatesRepository extends BaseRepository<Certificate> {
  constructor(db: any) {
    super(db, certificates);
  }

  async findById(id: number): Promise<Certificate | null> {
    try {
      const result = await this.db
        .select()
        .from(certificates)
        .where(eq(certificates.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByUid(certificateUid: string): Promise<Certificate | null> {
    try {
      const result = await this.db
        .select()
        .from(certificates)
        .where(eq(certificates.certificateUid, certificateUid))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByUid');
      return null;
    }
  }

  async findByStudentAndCourse(studentId: number, courseId: number): Promise<Certificate | null> {
    try {
      const result = await this.db
        .select()
        .from(certificates)
        .where(and(eq(certificates.studentId, studentId), eq(certificates.courseId, courseId)))
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
  } = {}): Promise<PaginatedResult<Certificate>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.studentId) {
        conditions.push(eq(certificates.studentId, options.studentId));
      }
      if (options.courseId) {
        conditions.push(eq(certificates.courseId, options.courseId));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(certificates)
          .where(whereClause)
          .orderBy(desc(certificates.issuedAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: certificates.id }).from(certificates).where(whereClause),
      ]);

      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<Certificate, 'id' | 'issuedAt'>): Promise<Certificate> {
    try {
      const result = await this.db.insert(certificates).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async findByStudent(studentId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Certificate>> {
    return this.findMany({ ...options, studentId });
  }

  async findByCourse(courseId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Certificate>> {
    return this.findMany({ ...options, courseId });
  }

  async count(filters?: { studentId?: number; courseId?: number }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.studentId) {
        conditions.push(eq(certificates.studentId, filters.studentId));
      }
      if (filters?.courseId) {
        conditions.push(eq(certificates.courseId, filters.courseId));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: certificates.id }).from(certificates).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
