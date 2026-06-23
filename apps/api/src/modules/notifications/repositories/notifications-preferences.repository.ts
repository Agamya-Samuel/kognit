import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../db/repositories/base.repository';
import { eq } from 'drizzle-orm';
import { userNotificationPreferences } from '../../../db/schema/user-notification-preferences';
import type { UserNotificationPreferences } from '../../../db/schema/user-notification-preferences';

@Injectable()
export class UserNotificationPreferencesRepository extends BaseRepository<UserNotificationPreferences> {
  constructor(db: any) {
    super(db, userNotificationPreferences);
  }

  async findByUserId(userId: number): Promise<UserNotificationPreferences | null> {
    try {
      const result = await this.db
        .select()
        .from(userNotificationPreferences)
        .where(eq(userNotificationPreferences.userId, userId))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      this.handleError(error, 'findByUserId');
      return null;
    }
  }

  async upsert(userId: number, preferences: Partial<Omit<UserNotificationPreferences, 'id' | 'createdAt' | 'updatedAt'>>): Promise<UserNotificationPreferences> {
    try {
      // Atomic upsert using the unique constraint on userId.
      // onConflictDoUpdate avoids the SELECT-then-INSERT race condition
      // where two concurrent requests could both INSERT duplicate rows.
      const result = await this.db
        .insert(userNotificationPreferences)
        .values({ userId, ...preferences })
        .onConflictDoUpdate({
          target: userNotificationPreferences.userId,
          set: { ...preferences, updatedAt: new Date() },
        })
        .returning();

      return result[0];
    } catch (error) {
      this.handleError(error, 'upsert');
      throw error;
    }
  }
}