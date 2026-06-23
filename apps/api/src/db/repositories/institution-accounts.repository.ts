import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { institutionAccounts } from '../schema';
import { eq, desc, count } from 'drizzle-orm';
import type { InstitutionAccount } from '../schema';

@Injectable()
export class InstitutionAccountsRepository extends BaseRepository<InstitutionAccount> {
  constructor(db: any) {
    super(db, institutionAccounts);
  }

  async findById(id: number): Promise<InstitutionAccount | null> {
    try {
      const result = await this.db
        .select()
        .from(institutionAccounts)
        .where(eq(institutionAccounts.id, id))
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
  } = {}): Promise<PaginatedResult<InstitutionAccount>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(institutionAccounts)
          .orderBy(desc(institutionAccounts.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(institutionAccounts.id) }).from(institutionAccounts),
      ]);

      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<InstitutionAccount, 'id' | 'createdAt'>): Promise<InstitutionAccount> {
    try {
      const result = await this.db.insert(institutionAccounts).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async update(id: number, data: Partial<Omit<InstitutionAccount, 'id' | 'createdAt'>>): Promise<InstitutionAccount | null> {
    try {
      const result = await this.db
        .update(institutionAccounts)
        .set(data)
        .where(eq(institutionAccounts.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'update');
      return null;
    }
  }

  async findByContactEmail(contactEmail: string): Promise<InstitutionAccount | null> {
    try {
      const result = await this.db
        .select()
        .from(institutionAccounts)
        .where(eq(institutionAccounts.contactEmail, contactEmail))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByContactEmail');
      return null;
    }
  }

  async count(): Promise<number> {
    try {
      const result = await this.db.select({ count: count(institutionAccounts.id) }).from(institutionAccounts);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
