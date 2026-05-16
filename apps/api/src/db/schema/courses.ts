import { pgTable, serial, integer, text, timestamp, varchar, boolean, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { pricingType } from './enums';

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  domain: varchar('domain', { length: 100 }).notNull(),
  pricingType: pricingType('pricing_type').notNull().default('free'),
  priceInr: integer('price_inr').notNull().default(0),
  isPublished: boolean('is_published').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('courses_instructor_id_idx').on(table.instructorId),
  index('courses_is_published_idx').on(table.isPublished),
  index('courses_deleted_at_idx').on(table.deletedAt),
  index('courses_domain_idx').on(table.domain),
]);

export type Course = InferSelectModel<typeof courses>;
