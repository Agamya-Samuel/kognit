import { pgTable, serial, integer, text, timestamp, varchar } from 'drizzle-orm/pg-core';
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
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Assignment = InferSelectModel<typeof assignments>;
