import { pgTable, serial, integer, timestamp, varchar, text, date, time, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { courses } from './courses';

export const recurringSchedules = pgTable('recurring_schedules', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 255 }).notNull(),
  daysOfWeek: text('days_of_week').notNull(), // JSON array: ["mon","wed","fri"]
  startTime: time('start_time').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  meetingLink: varchar('meeting_link', { length: 500 }),
  livekitRoomPrefix: varchar('livekit_room_prefix', { length: 255 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('recurring_schedules_course_id_idx').on(table.courseId),
]);

export type RecurringSchedule = InferSelectModel<typeof recurringSchedules>;
