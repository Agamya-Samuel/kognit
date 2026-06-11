import { pgTable, serial, integer, text, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { pricingType, courseStatus, courseStructure } from './enums';

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  domain: varchar('domain', { length: 100 }).notNull(),
  pricingType: pricingType('pricing_type').notNull().default('free'),
  priceInr: integer('price_inr').notNull().default(0),
  courseStructure: courseStructure('course_structure').notNull(),
  status: courseStatus('status').notNull().default('draft'),
  revisionNotes: text('revision_notes'),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('courses_instructor_id_idx').on(table.instructorId),
  index('courses_status_idx').on(table.status),
  index('courses_deleted_at_idx').on(table.deletedAt),
  index('courses_domain_idx').on(table.domain),
  index('courses_course_structure_idx').on(table.courseStructure),
]);

export type Course = InferSelectModel<typeof courses>;
