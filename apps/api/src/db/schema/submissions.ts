import { pgTable, serial, integer, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { assignments } from './assignments';
import { users } from './users';

export const submissions = pgTable('submissions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').notNull().references(() => assignments.id, { onDelete: 'restrict' }),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  content: text('content'),
  score: integer('score'),
  feedback: text('feedback'),
  gradedAt: timestamp('graded_at'),
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
}, (table) => ({
  uniqueAssignmentStudent: {
    columns: [table.assignmentId, table.studentId],
  },
}));

export type Submission = InferSelectModel<typeof submissions>;
