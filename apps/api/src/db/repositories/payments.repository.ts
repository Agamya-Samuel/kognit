import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { payments } from '../schema';
import { eq, and, desc, gte, sql, inArray } from 'drizzle-orm';
import type { Payment } from '../schema';
import { users } from '../schema/users';
import { courses } from '../schema/courses';
import { enrollments } from '../schema/enrollments';

@Injectable()
export class PaymentsRepository extends BaseRepository<Payment> {
  constructor(db: any) {
    super(db, payments);
  }

  async findById(id: number): Promise<Payment | null> {
    try {
      const result = await this.db
        .select()
        .from(payments)
        .where(eq(payments.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    try {
      const result = await this.db
        .select()
        .from(payments)
        .where(eq(payments.razorpayOrderId, razorpayOrderId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByRazorpayOrderId');
      return null;
    }
  }

  async findByRazorpayPaymentId(razorpayPaymentId: string): Promise<Payment | null> {
    try {
      const result = await this.db
        .select()
        .from(payments)
        .where(eq(payments.razorpayPaymentId, razorpayPaymentId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByRazorpayPaymentId');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    studentId?: number;
    courseId?: number;
    status?: string;
  } = {}): Promise<PaginatedResult<Payment>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.studentId) {
        conditions.push(eq(payments.studentId, options.studentId));
      }
      if (options.courseId) {
        conditions.push(eq(payments.courseId, options.courseId));
      }
      if (options.status) {
        conditions.push(eq(payments.status, options.status as any));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(payments)
          .where(whereClause)
          .orderBy(desc(payments.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: payments.id }).from(payments).where(whereClause),
      ]);

      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    try {
      const result = await this.db.insert(payments).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<Payment, 'id' | 'createdAt'>>): Promise<Payment | null> {
    try {
      const result = await this.db
        .update(payments)
        .set(data)
        .where(eq(payments.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async findByStudent(studentId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Payment>> {
    return this.findMany({ ...options, studentId });
  }

  async findByCourse(courseId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Payment>> {
    return this.findMany({ ...options, courseId });
  }

  async count(filters?: { studentId?: number; courseId?: number; status?: string }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.studentId) {
        conditions.push(eq(payments.studentId, filters.studentId));
      }
      if (filters?.courseId) {
        conditions.push(eq(payments.courseId, filters.courseId));
      }
      if (filters?.status) {
        conditions.push(eq(payments.status, filters.status as any));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: payments.id }).from(payments).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }

  async sumPaidAmount(): Promise<number> {
    try {
      const result = await this.db
        .select({ total: sql`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .where(eq(payments.status, 'paid'));
      return Number(result[0]?.total) || 0;
    } catch (error) {
      this.handleError(error, 'sumPaidAmount');
      return 0;
    }
  }

  async sumPaidAmountByCourseIds(courseIds: number[]): Promise<number> {
    if (courseIds.length === 0) return 0;
    
    try {
      const result = await this.db
        .select({ total: sql`COALESCE(SUM(${payments.amount}), 0)` })
        .from(payments)
        .where(and(
          eq(payments.status, 'paid'),
          inArray(payments.courseId, courseIds)
        ));
      
      return Number(result[0]?.total) || 0;
    } catch (error) {
      this.handleError(error, 'sumPaidAmountByCourseIds');
      return 0;
    }
  }

   async getDailyStats(startDate: Date): Promise<{ name: string; users: number; revenue: number }[]> {
     try {
       const result = await this.db
         .select({
           date: sql`DATE(${payments.createdAt})`,
           total: sql`COALESCE(SUM(${payments.amount}), 0)`,
           count: sql`COUNT(DISTINCT ${payments.studentId})`,
         })
         .from(payments)
         .where(and(
           gte(payments.createdAt, startDate),
           eq(payments.status, 'paid')
         ))
         .groupBy(sql`DATE(${payments.createdAt})`)
         .orderBy(sql`DATE(${payments.createdAt})`);

       return result.map(row => ({
         name: String(row.date),
         users: Number(row.count) || 0,
         revenue: Number(row.total) || 0,
       }));
     } catch (error) {
       this.handleError(error, 'getDailyStats');
       return [];
     }
   }

   async getRevenueBreakdown(): Promise<{ courseId: number; total: number }[]> {
     try {
       const result = await this.db
         .select({
           courseId: payments.courseId,
           total: sql`COALESCE(SUM(${payments.amount}), 0)`,
         })
         .from(payments)
         .where(eq(payments.status, 'paid'))
         .groupBy(payments.courseId);

       return result.map(row => ({
         courseId: row.courseId,
         total: Number(row.total) || 0,
       }));
     } catch (error) {
       this.handleError(error, 'getRevenueBreakdown');
       return [];
     }
   }

   async getInstructorDailyStats(instructorId: number, startDate: Date): Promise<{ date: string; totalRevenue: number; uniqueUsers: number }[]> {
     try {
       const result = await this.db
         .select({
           date: sql`DATE(${payments.createdAt})`,
           totalRevenue: sql`COALESCE(SUM(${payments.amount}), 0)`,
           uniqueUsers: sql`COUNT(DISTINCT ${payments.studentId})`,
         })
         .from(payments)
         .innerJoin(courses, eq(payments.courseId, courses.id))
         .where(and(
           gte(payments.createdAt, startDate),
           eq(payments.status, 'paid'),
           eq(courses.instructorId, instructorId)
         ))
         .groupBy(sql`DATE(${payments.createdAt})`)
         .orderBy(sql`DATE(${payments.createdAt})`);

       return result.map(row => ({
         date: String(row.date),
         totalRevenue: Number(row.totalRevenue) || 0,
         uniqueUsers: Number(row.uniqueUsers) || 0,
       }));
     } catch (error) {
       this.handleError(error, 'getInstructorDailyStats');
       return [];
     }
   }
}