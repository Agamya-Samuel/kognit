import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { waitlist } from '../schema';
import { eq, and, desc, isNull, count } from 'drizzle-orm';
import type { WaitlistEntry } from '../schema';

@Injectable()
export class WaitlistRepository extends BaseRepository<WaitlistEntry> {
  constructor(db: any) {
    super(db, waitlist);
  }

  async findById(id: number): Promise<WaitlistEntry | null> {
    try {
      const result = await this.db
        .select()
        .from(waitlist)
        .where(eq(waitlist.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByEmail(email: string): Promise<WaitlistEntry | null> {
    try {
      const result = await this.db
        .select()
        .from(waitlist)
        .where(eq(waitlist.email, email))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByEmail');
      return null;
    }
  }

  async findByUnsubscribeToken(token: string): Promise<WaitlistEntry | null> {
    try {
      const result = await this.db
        .select()
        .from(waitlist)
        .where(eq(waitlist.unsubscribeToken, token))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByUnsubscribeToken');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    source?: string;
    activeOnly?: boolean;
  } = {}): Promise<PaginatedResult<WaitlistEntry>> {
    const defaultLimit = 20;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.source) {
        conditions.push(eq(waitlist.source, options.source as any));
      }
      if (options.activeOnly) {
        conditions.push(isNull(waitlist.unsubscribedAt));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(waitlist)
          .where(whereClause)
          .orderBy(desc(waitlist.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(waitlist.id) }).from(waitlist).where(whereClause),
      ]);

      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<WaitlistEntry, 'id' | 'createdAt'>): Promise<WaitlistEntry> {
    try {
      const result = await this.db.insert(waitlist).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async unsubscribe(id: number): Promise<WaitlistEntry | null> {
    try {
      const result = await this.db
        .update(waitlist)
        .set({ unsubscribedAt: new Date() })
        .where(eq(waitlist.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'unsubscribe');
      return null;
    }
  }

  async count(filters?: { source?: string; activeOnly?: boolean }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.source) {
        conditions.push(eq(waitlist.source, filters.source as any));
      }
      if (filters?.activeOnly) {
        conditions.push(isNull(waitlist.unsubscribedAt));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: count(waitlist.id) }).from(waitlist).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
