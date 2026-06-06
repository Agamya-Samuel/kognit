import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { refreshTokens } from '../schema';
import { eq, and, sql } from 'drizzle-orm';
import type { RefreshToken } from '../schema';

@Injectable()
export class RefreshTokensRepository extends BaseRepository<RefreshToken> {
  constructor(db: any) {
    super(db, refreshTokens);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    try {
      const result = await this.db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByTokenHash');
      return null;
    }
  }

  async findActiveByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    try {
      const result = await this.db
        .select()
        .from(refreshTokens)
        .where(and(eq(refreshTokens.tokenHash, tokenHash), eq(refreshTokens.isRevoked, false)))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findActiveByTokenHash');
      return null;
    }
  }

  async findActiveByUserId(userId: number): Promise<RefreshToken[]> {
    try {
      return await this.db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.userId, userId),
            eq(refreshTokens.isRevoked, false),
            sql`${refreshTokens.expiresAt} > now()`,
          ),
        );
    } catch (error) {
      this.handleError(error, 'findActiveByUserId');
      return [];
    }
  }

  async findByFamily(family: string): Promise<RefreshToken[]> {
    try {
      return await this.db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.family, family));
    } catch (error) {
      this.handleError(error, 'findByFamily');
      return [];
    }
  }

  async create(data: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken> {
    try {
      const result = await this.db.insert(refreshTokens).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async revoke(id: number): Promise<RefreshToken | null> {
    try {
      const result = await this.db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'revoke');
      return null;
    }
  }

  async revokeAllByUserId(userId: number): Promise<number> {
    try {
      const result = await this.db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(and(eq(refreshTokens.userId, userId), eq(refreshTokens.isRevoked, false)))
        .returning();
      return result.length;
    } catch (error) {
      this.handleError(error, 'revokeAllByUserId');
      return 0;
    }
  }

  async revokeFamily(family: string): Promise<number> {
    try {
      const result = await this.db
        .update(refreshTokens)
        .set({ isRevoked: true })
        .where(and(eq(refreshTokens.family, family), eq(refreshTokens.isRevoked, false)))
        .returning();
      return result.length;
    } catch (error) {
      this.handleError(error, 'revokeFamily');
      return 0;
    }
  }

  async deleteExpired(): Promise<number> {
    try {
      const result = await this.db
        .delete(refreshTokens)
        .where(sql`${refreshTokens.expiresAt} < now()`)
        .returning();
      return result.length;
    } catch (error) {
      this.handleError(error, 'deleteExpired');
      return 0;
    }
  }
}
