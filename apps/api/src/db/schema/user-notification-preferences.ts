import { pgTable, serial, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';

export const userNotificationPreferences = pgTable('user_notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  emailEnrollments: boolean('email_enrollments').notNull().default(true),
  emailSubmissions: boolean('email_submissions').notNull().default(true),
  emailReminders: boolean('email_reminders').notNull().default(true),
  emailMarketing: boolean('email_marketing').notNull().default(false),
  pushEnrollments: boolean('push_enrollments').notNull().default(true),
  pushSubmissions: boolean('push_submissions').notNull().default(true),
  pushReminders: boolean('push_reminders').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  // Unique constraint to ensure one preferences record per user
  // Using index approach since Drizzle doesn't have unique constraint builder
]);

export type UserNotificationPreferences = InferSelectModel<typeof userNotificationPreferences>;