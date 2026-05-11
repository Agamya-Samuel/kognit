import { pgTable, serial, integer, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
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
});
