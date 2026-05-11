import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { passwordResets } from '../schema';
import { eq, and } from 'drizzle-orm';
import type { PasswordReset } from '../schema';

@Injectable()
export class PasswordResetsRepository extends BaseRepository<PasswordReset> {
  constructor(db: any) {
    super(db, passwordResets);
  }

  async findById(id: number): Promise<PasswordReset | null> {
    try {
      const result = await this.db
        .select()
        .from(passwordResets)
        .where(eq(passwordResets.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordReset | null> {
    try {
      const result = await this.db
        .select()
        .from(passwordResets)
        .where(eq(passwordResets.tokenHash, tokenHash))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByTokenHash');
      return null;
    }
  }

  async findActiveByUserId(userId: number): Promise<PasswordReset | null> {
    try {
      const result = await this.db
        .select()
        .from(passwordResets)
        .where(and(eq(passwordResets.userId, userId), eq(passwordResets.used, false)))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findActiveByUserId');
      return null;
    }
  }

  async create(data: Omit<PasswordReset, 'id' | 'createdAt'>): Promise<PasswordReset> {
    try {
      const result = await this.db.insert(passwordResets).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async markAsUsed(id: number): Promise<PasswordReset | null> {
    try {
      const result = await this.db
        .update(passwordResets)
        .set({ used: true })
        .where(eq(passwordResets.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'markAsUsed');
      return null;
    }
  }
}
