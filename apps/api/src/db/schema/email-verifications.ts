import { pgTable, serial, integer, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { emailVerificationPurpose } from './enums';

export const emailVerifications = pgTable('email_verifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  purpose: emailVerificationPurpose('purpose').notNull().default('email_verify'),
  expiresAt: timestamp('expires_at').notNull(),
  verified: boolean('verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('email_verifications_token_hash_idx').on(table.tokenHash),
  index('email_verifications_user_id_idx').on(table.userId),
  index('email_verifications_purpose_idx').on(table.purpose),
]);

export type EmailVerification = InferSelectModel<typeof emailVerifications>;
