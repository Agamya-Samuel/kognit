import { pgTable, serial, integer, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';

export const refreshTokens = pgTable('refresh_tokens', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 60 }).notNull().unique(),
  // Token family for reuse detection: all tokens in the same rotation chain share the same family
  family: varchar('family', { length: 60 }).notNull(),
  isRevoked: boolean('is_revoked').notNull().default(false),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('refresh_tokens_user_id_idx').on(table.userId),
  index('refresh_tokens_family_idx').on(table.family),
]);

export type RefreshToken = InferSelectModel<typeof refreshTokens>;
