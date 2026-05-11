import { pgTable, serial, integer, varchar, timestamp } from 'drizzle-orm/pg-core';
import { courses } from './courses';

export const sections = pgTable('sections', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 255 }).notNull(),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
