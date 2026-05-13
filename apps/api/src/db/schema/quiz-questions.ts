import { pgTable, serial, integer, text, varchar } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { assignments } from './assignments';

export const quizQuestions = pgTable('quiz_questions', {
  id: serial('id').primaryKey(),
  assignmentId: integer('assignment_id').notNull().references(() => assignments.id, { onDelete: 'cascade' }),
  questionText: text('question_text').notNull(),
  options: text('options').notNull(), // JSON array of option strings
  correctOptionIndex: integer('correct_option_index').notNull(),
  points: integer('points').notNull().default(1),
  orderIndex: integer('order_index').notNull().default(0),
});

export type QuizQuestion = InferSelectModel<typeof quizQuestions>;
