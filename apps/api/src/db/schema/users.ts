import { pgTable, serial, varchar, boolean, timestamp, text, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { userRoles } from './enums';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }),
  role: userRoles('role').notNull().default('student'),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 500 }),
  isVerified: boolean('is_verified').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('users_role_idx').on(table.role),
  index('users_is_active_idx').on(table.isActive),
]);

export type User = InferSelectModel<typeof users>;
