import { pgTable, serial, integer, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';

export const passwordResets = pgTable('password_resets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  tokenHash: varchar('token_hash', { length: 60 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('password_resets_token_hash_idx').on(table.tokenHash),
  index('password_resets_user_id_idx').on(table.userId),
]);

export type PasswordReset = InferSelectModel<typeof passwordResets>;
