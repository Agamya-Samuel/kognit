import { pgTable, serial, varchar, boolean, timestamp, text, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { userRoles, approvalStatus } from './enums';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: userRoles('role').notNull().default('student'),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isVerified: boolean('is_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  approvalStatus: approvalStatus('approval_status').notNull().default('approved'),
  onboardingCompleted: boolean('onboarding_completed').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('users_role_idx').on(table.role),
  index('users_is_active_idx').on(table.isActive),
  index('users_approval_status_idx').on(table.approvalStatus),
  index('users_onboarding_completed_idx').on(table.onboardingCompleted),
]);

export type User = InferSelectModel<typeof users>;
