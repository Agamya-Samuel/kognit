import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { waitlistSource } from './enums';

export const waitlist = pgTable('waitlist', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  unsubscribedAt: timestamp('unsubscribed_at'),
  unsubscribeToken: varchar('unsubscribe_token', { length: 255 }).notNull().unique(),
  source: waitlistSource('source').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
