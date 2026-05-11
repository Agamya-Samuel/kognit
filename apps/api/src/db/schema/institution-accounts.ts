import { pgTable, serial, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';

export const institutionAccounts = pgTable('institution_accounts', {
  id: serial('id').primaryKey(),
  institutionName: varchar('institution_name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  razorpayCustomerId: varchar('razorpay_customer_id', { length: 255 }),
  seatCount: integer('seat_count').notNull(),
  activeUntil: timestamp('active_until').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type InstitutionAccount = InferSelectModel<typeof institutionAccounts>;
