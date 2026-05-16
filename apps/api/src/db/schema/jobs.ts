import { pgTable, serial, integer, text, timestamp, varchar, boolean, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { courses } from './courses';

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  company: varchar('company', { length: 255 }).notNull(),
  description: text('description'),
  domain: varchar('domain', { length: 100 }).notNull(),
  location: varchar('location', { length: 255 }).notNull(),
  url: varchar('url', { length: 500 }),
  postedBy: integer('posted_by').notNull().references(() => users.id, { onDelete: 'restrict' }),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'set null' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('jobs_posted_by_idx').on(table.postedBy),
  index('jobs_course_id_idx').on(table.courseId),
  index('jobs_domain_idx').on(table.domain),
  index('jobs_is_active_idx').on(table.isActive),
]);

export type Job = InferSelectModel<typeof jobs>;
