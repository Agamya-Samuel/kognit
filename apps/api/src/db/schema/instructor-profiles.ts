import { pgTable, serial, integer, text, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { approvalStatus } from './enums';

export const instructorProfiles = pgTable('instructor_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  bio: text('bio'),
  expertise: text('expertise').array().notNull().default([]),
  socialLinks: text('social_links').array().notNull().default([]),
  approvalStatus: approvalStatus('approval_status').notNull().default('pending'),
  razorpaySellerAccountId: varchar('razorpay_seller_account_id', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('instructor_profiles_user_id_idx').on(table.userId),
  index('instructor_profiles_approval_status_idx').on(table.approvalStatus),
]);

export type InstructorProfile = InferSelectModel<typeof instructorProfiles>;
