import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { users } from '../schema';
import { eq, and, desc, or, gte, count, ilike } from 'drizzle-orm';
import type { User } from '../schema';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(db: any) {
    super(db, users);
  }

  async findById(id: number): Promise<User | null> {
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByEmail');
      return null;
    }
  }

  async findMany(options: { offset?: number; limit?: number; role?: string; search?: string } = {}): Promise<PaginatedResult<User>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;
      const role = options.role;
      const search = options.search;

      const conditions = [];
      if (role) {
        conditions.push(eq(users.role, role as any));
      }
      if (search) {
        conditions.push(
          or(
            ilike(users.name, `%${search}%`),
            ilike(users.email, `%${search}%`),
          ),
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(users)
          .where(whereClause)
          .orderBy(desc(users.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(users.id) }).from(users).where(whereClause),
      ]);

      return {
        data,
        total: totalResult[0]?.count ?? 0,
        limit,
        offset,
      };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || 10, offset: options.offset || 0 };
    }
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const result = await this.db.insert(users).values(userData).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, userData: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User | null> {
    try {
      const result = await this.db
        .update(users)
        .set({ ...userData, updatedAt: new Date() })
        .where(eq(users.id, id))
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
        .update(users)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(users.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      this.handleError(error, 'softDelete');
      return false;
    }
  }

  async count(filters?: { role?: string; isActive?: boolean }): Promise<number> {
    try {
      const conditions = [];

      if (filters?.role) {
        conditions.push(eq(users.role, filters.role as any));
      }

      if (filters?.isActive !== undefined) {
        conditions.push(eq(users.isActive, filters.isActive));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await this.db.select({ count: count(users.id) }).from(users).where(whereClause);
      return result[0]?.count ?? 0;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }

  async countAfterDate(date: Date): Promise<number> {
    try {
      const result = await this.db
        .select({ count: count(users.id) })
        .from(users)
        .where(gte(users.createdAt, date));
      return result[0]?.count ?? 0;
    } catch (error) {
      this.handleError(error, 'countAfterDate');
      return 0;
    }
  }
}