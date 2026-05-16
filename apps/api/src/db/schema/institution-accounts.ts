import { pgTable, serial, timestamp, varchar, integer, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';

export const institutionAccounts = pgTable('institution_accounts', {
  id: serial('id').primaryKey(),
  institutionName: varchar('institution_name', { length: 255 }).notNull(),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  razorpayCustomerId: varchar('razorpay_customer_id', { length: 255 }),
  seatCount: integer('seat_count').notNull(),
  activeUntil: timestamp('active_until').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('institution_accounts_contact_email_idx').on(table.contactEmail),
]);

export type InstitutionAccount = InferSelectModel<typeof institutionAccounts>;
