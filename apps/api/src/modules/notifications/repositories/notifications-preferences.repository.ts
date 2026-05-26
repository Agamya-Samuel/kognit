import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../db/repositories/base.repository';
import { userNotificationPreferences } from '../../../db/schema/user-notification-preferences';
import { eq } from 'drizzle-orm';
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
      // Check if preferences already exist for this user
      const existing = await this.findByUserId(userId);
      
      if (existing) {
        // Update existing record
        const result = await this.db
          .update(userNotificationPreferences)
          .set({ ...preferences, updatedAt: new Date() })
          .where(eq(userNotificationPreferences.userId, userId))
          .returning();
        
        return result[0];
      } else {
        // Create new record
        const result = await this.db
          .insert(userNotificationPreferences)
          .values({ userId, ...preferences })
          .returning();
        
        return result[0];
      }
    } catch (error) {
      this.handleError(error, 'upsert');
      throw error;
    }
  }
}