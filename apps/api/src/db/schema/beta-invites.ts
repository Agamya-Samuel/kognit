import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';

export const betaInvites = pgTable('beta_invites', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 12 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull(),
  invitedBy: integer('invited_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  usedBy: integer('used_by').references(() => users.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at').notNull(),
  maxUses: integer('max_uses').notNull().default(1),
  useCount: integer('use_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type BetaInvite = InferSelectModel<typeof betaInvites>;
