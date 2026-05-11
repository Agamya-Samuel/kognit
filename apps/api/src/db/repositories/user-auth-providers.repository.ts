import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { userAuthProviders } from '../schema';
import { eq, and, desc } from 'drizzle-orm';
import type { UserAuthProvider } from '../schema';

@Injectable()
export class UserAuthProvidersRepository extends BaseRepository<UserAuthProvider> {
  constructor(db: any) {
    super(db, userAuthProviders);
  }

  async findById(id: number): Promise<UserAuthProvider | null> {
    try {
      const result = await this.db
        .select()
        .from(userAuthProviders)
        .where(eq(userAuthProviders.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByProviderAndProviderId(provider: string, providerId: string): Promise<UserAuthProvider | null> {
    try {
      const result = await this.db
        .select()
        .from(userAuthProviders)
        .where(and(eq(userAuthProviders.provider, provider), eq(userAuthProviders.providerId, providerId)))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByProviderAndProviderId');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    userId?: number;
    provider?: string;
  } = {}): Promise<PaginatedResult<UserAuthProvider>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.userId) {
        conditions.push(eq(userAuthProviders.userId, options.userId));
      }
      if (options.provider) {
        conditions.push(eq(userAuthProviders.provider, options.provider));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(userAuthProviders)
          .where(whereClause)
          .orderBy(desc(userAuthProviders.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: userAuthProviders.id }).from(userAuthProviders).where(whereClause),
      ]);

      return { data, total: totalResult.length, limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<UserAuthProvider, 'id' | 'createdAt'>): Promise<UserAuthProvider> {
    try {
      const result = await this.db.insert(userAuthProviders).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async findByUser(userId: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<UserAuthProvider>> {
    return this.findMany({ ...options, userId });
  }

  async count(filters?: { userId?: number; provider?: string }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.userId) {
        conditions.push(eq(userAuthProviders.userId, filters.userId));
      }
      if (filters?.provider) {
        conditions.push(eq(userAuthProviders.provider, filters.provider));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: userAuthProviders.id }).from(userAuthProviders).where(whereClause);
      return result.length;
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
