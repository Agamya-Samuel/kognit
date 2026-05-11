import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';

export const userAuthProviders = pgTable('user_auth_providers', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueProviderProviderId: {
    columns: [table.provider, table.providerId],
  },
}));

export type UserAuthProvider = InferSelectModel<typeof userAuthProviders>;
