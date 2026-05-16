import { pgTable, serial, integer, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { courses } from './courses';
import { channelType } from './enums';

export const channels = pgTable('channels', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').references(() => courses.id, { onDelete: 'set null' }),
  type: channelType('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('channels_course_id_idx').on(table.courseId),
]);

export type Channel = InferSelectModel<typeof channels>;
