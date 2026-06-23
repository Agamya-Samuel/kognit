import { Injectable } from '@nestjs/common';
import { BaseRepository, PaginatedResult } from './base.repository';
import { betaInvites } from '../schema';
import { eq, and, desc, gt, lt, sql, count } from 'drizzle-orm';
import type { BetaInvite } from '../schema';

@Injectable()
export class BetaInvitesRepository extends BaseRepository<BetaInvite> {
  constructor(db: any) {
    super(db, betaInvites);
  }

  async findById(id: number): Promise<BetaInvite | null> {
    try {
      const result = await this.db
        .select()
        .from(betaInvites)
        .where(eq(betaInvites.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByCode(code: string): Promise<BetaInvite | null> {
    try {
      const result = await this.db
        .select()
        .from(betaInvites)
        .where(eq(betaInvites.code, code))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByCode');
      return null;
    }
  }

  async findMany(options: {
    offset?: number;
    limit?: number;
    invitedBy?: number;
    usedBy?: number;
  } = {}): Promise<PaginatedResult<BetaInvite>> {
    const defaultLimit = 10;
    const defaultOffset = 0;
    try {
      const offset = options.offset ?? defaultOffset;
      const limit = options.limit ?? defaultLimit;

      const conditions = [];
      if (options.invitedBy) {
        conditions.push(eq(betaInvites.invitedBy, options.invitedBy));
      }
      if (options.usedBy) {
        conditions.push(eq(betaInvites.usedBy, options.usedBy));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [data, totalResult] = await Promise.all([
        this.db
          .select()
          .from(betaInvites)
          .where(whereClause)
          .orderBy(desc(betaInvites.createdAt))
          .limit(limit)
          .offset(offset),
        this.db.select({ count: count(betaInvites.id) }).from(betaInvites).where(whereClause),
      ]);

      return { data, total: Number(totalResult[0]?.count ?? 0), limit, offset };
    } catch (error) {
      this.handleError(error, 'findMany');
      return { data: [], total: 0, limit: options.limit || defaultLimit, offset: options.offset || defaultOffset };
    }
  }

  async create(data: Omit<BetaInvite, 'id' | 'createdAt' | 'useCount'>): Promise<BetaInvite> {
    try {
      const result = await this.db.insert(betaInvites).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async incrementUseCount(id: number): Promise<BetaInvite | null> {
    try {
      // Atomic: only increment if useCount is still below maxUses.
      // Prevents the race where two concurrent redemptions both pass an
      // app-level `isCodeValid` check and both increment past maxUses.
      // Returns the updated row, or null if the invite is already exhausted.
      const result = await this.db
        .update(betaInvites)
        .set({ useCount: sql`${betaInvites.useCount} + 1` })
        .where(and(eq(betaInvites.id, id), lt(betaInvites.useCount, betaInvites.maxUses)))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'incrementUseCount');
      return null;
    }
  }

  async markAsUsed(id: number, usedBy: number): Promise<BetaInvite | null> {
    try {
      // Atomic check-and-set: only marks used + increments if useCount is
      // still below maxUses. Same race-prevention as incrementUseCount.
      const result = await this.db
        .update(betaInvites)
        .set({ usedBy, useCount: sql`${betaInvites.useCount} + 1` })
        .where(and(eq(betaInvites.id, id), lt(betaInvites.useCount, betaInvites.maxUses)))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'markAsUsed');
      return null;
    }
  }

  async isCodeValid(code: string): Promise<boolean> {
    try {
      const invite = await this.findByCode(code);
      if (!invite) return false;
      const now = new Date();
      if (invite.expiresAt < now) return false;
      if (invite.useCount >= invite.maxUses) return false;
      return true;
    } catch (error) {
      this.handleError(error, 'isCodeValid');
      return false;
    }
  }

  async findByInviter(invitedBy: number, options: { offset?: number; limit?: number } = {}): Promise<PaginatedResult<BetaInvite>> {
    return this.findMany({ ...options, invitedBy });
  }

  async count(filters?: { invitedBy?: number }): Promise<number> {
    try {
      const conditions = [];
      if (filters?.invitedBy) {
        conditions.push(eq(betaInvites.invitedBy, filters.invitedBy));
      }
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
      const result = await this.db.select({ count: count(betaInvites.id) }).from(betaInvites).where(whereClause);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      this.handleError(error, 'count');
      return 0;
    }
  }
}
