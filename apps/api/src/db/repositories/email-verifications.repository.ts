import { Injectable } from '@nestjs/common';
import { BaseRepository } from './base.repository';
import { emailVerifications } from '../schema';
import { eq, and } from 'drizzle-orm';
import type { EmailVerification } from '../schema';

@Injectable()
export class EmailVerificationsRepository extends BaseRepository<EmailVerification> {
  constructor(db: any) {
    super(db, emailVerifications);
  }

  async findById(id: number): Promise<EmailVerification | null> {
    try {
      const result = await this.db
        .select()
        .from(emailVerifications)
        .where(eq(emailVerifications.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findById');
      return null;
    }
  }

  async findByTokenHash(tokenHash: string): Promise<EmailVerification | null> {
    try {
      const result = await this.db
        .select()
        .from(emailVerifications)
        .where(eq(emailVerifications.tokenHash, tokenHash))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByTokenHash');
      return null;
    }
  }

  async findActiveByUserId(userId: number): Promise<EmailVerification | null> {
    try {
      const result = await this.db
        .select()
        .from(emailVerifications)
        .where(and(eq(emailVerifications.userId, userId), eq(emailVerifications.verified, false)))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findActiveByUserId');
      return null;
    }
  }

  async create(data: Omit<EmailVerification, 'id' | 'createdAt'>): Promise<EmailVerification> {
    try {
      const result = await this.db.insert(emailVerifications).values(data).returning();
      return result[0];
    } catch (error) {
      this.handleError(error, 'create');
      throw error;
    }
  }

  async markAsVerified(id: number): Promise<EmailVerification | null> {
    try {
      const result = await this.db
        .update(emailVerifications)
        .set({ verified: true })
        .where(eq(emailVerifications.id, id))
        .returning();
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'markAsVerified');
      return null;
    }
  }
}
