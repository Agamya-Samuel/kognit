import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { notifications } from '../schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import type { Notification } from '../schema';

@Injectable()
export class NotificationsRepository extends BaseRepository<Notification> {
  constructor(db: any) {
    super(db, notifications);
  }

  async findById(id: number): Promise<Notification | null> {
    try {
      const result = await this.db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id))
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
    userId?: number;
    isRead?: boolean;
    type?: string;
  } = {}): Promise<PaginatedResult<Notification>> {
    const defaultLimit = 20;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.userId) {
        conditions.push(eq(notifications.userId, options.userId));
      }
      if (options.isRead !== undefined) {
        conditions.push(eq(notifications.isRead, options.isRead));
      }
      if (options.type) {
        conditions.push(eq(notifications.type, options.type));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(notifications)
          .where(whereClause)
          .orderBy(desc(notifications.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(notifications.id) }).from(notifications).where(whereClause),
      ]);

      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: {
    userId: number;
    type: string;
    title: string;
    body?: string | null;
    isRead?: boolean;
    deliveredVia?: 'in_app' | 'email' | 'both';
    emailSentAt?: Date | null;
    jobId?: string | null;
    smsSentAt?: Date | null;
  }): Promise<Notification> {
    try {
      const result = await this.db.insert(notifications).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async markAsRead(id: number): Promise<Notification | null> {
    try {
      const result = await this.db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'markAsRead');
      return null;
    }
  }

  async markAllAsRead(userId: number): Promise<number> {
    try {
      const result = await this.db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
        .returning();
      return result.length;
    } catch (error) {
      this.handleError(error, 'markAllAsRead');
      return 0;
    }
  }

  async findByUser(userId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<Notification>> {
    return this.findMany({ ...options, userId });
  }

  async updateJobId(id: number, jobId: string): Promise<void> {
    await this.db.update(notifications).set({ jobId }).where(eq(notifications.id, id));
  }

  async updateEmailSentAt(id: number): Promise<void> {
    await this.db.update(notifications).set({ emailSentAt: new Date() }).where(eq(notifications.id, id));
  }

  async updateSmsSentAt(id: number): Promise<void> {
    await this.db.update(notifications).set({ smsSentAt: new Date() }).where(eq(notifications.id, id));
  }

  async count(filters?: { userId?: number; isRead?: boolean }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.userId) {
        conditions.push(eq(notifications.userId, filters.userId));
      }
      if (filters?.isRead !== undefined) {
        conditions.push(eq(notifications.isRead, filters.isRead));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: count(notifications.id) }).from(notifications).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
