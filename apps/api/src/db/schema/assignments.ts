import { pgTable, serial, integer, text, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { lectures } from './lectures';
import { assignmentType } from './enums';

export const assignments = pgTable('assignments', {
  id: serial('id').primaryKey(),
  lectureId: integer('lecture_id').notNull().references(() => lectures.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: assignmentType('type').notNull().default('short'),
  maxScore: integer('max_score').notNull(),
  dueAt: timestamp('due_at').notNull(),
  lateWindowHours: integer('late_window_hours'),
  latePenaltyPercent: integer('late_penalty_percent').notNull().default(0),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('assignments_lecture_id_idx').on(table.lectureId),
  index('assignments_deleted_at_idx').on(table.deletedAt),
]);

export type Assignment = InferSelectModel<typeof assignments>;
