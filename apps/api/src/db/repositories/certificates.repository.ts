import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { certificates } from '../schema';
import { eq, and, desc, count } from 'drizzle-orm';
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
        this.db.select({ count: count(certificates.id) }).from(certificates).where(whereClause),
      ]);

      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
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

  /**
   * Atomically insert a certificate only if no certificate already exists
   * for (studentId, courseId). Returns the inserted row, or the existing
   * row if a certificate is already on file.
   *
   * This prevents the race where two concurrent autoIssueCertificate calls
   * for the same (student, course) both pass the "does it exist?" check and
   * both insert — leaving duplicate rows.
   */
  async createIfNotExists(data: Omit<Certificate, 'id' | 'issuedAt'>): Promise<Certificate> {
    try {
      const result = await this.db
        .insert(certificates)
        .values(data)
        .onConflictDoNothing({ target: [certificates.studentId, certificates.courseId] })
        .returning();

      if (result[0]) return result[0];

      // Another request inserted first. Return the existing row.
      const existing = await this.findByStudentAndCourse(data.studentId, data.courseId);
      if (!existing) {
        throw new Error('Certificate createIfNotExists: insert silently failed and no existing row found');
      }
      return existing;
    } catch (error) {
      this.handleError(error, 'createIfNotExists');
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
      const result = await this.db.select({ count: count(certificates.id) }).from(certificates).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
