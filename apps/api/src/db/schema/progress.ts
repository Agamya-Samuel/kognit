import { pgTable, serial, integer, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { lectures } from './lectures';

export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  lectureId: integer('lecture_id').notNull().references(() => lectures.id, { onDelete: 'restrict' }),
  watchedSeconds: integer('watched_seconds').notNull().default(0),
  isCompleted: boolean('is_completed').notNull().default(false),
  lastWatchedAt: timestamp('last_watched_at').notNull().defaultNow(),
}, (table) => [
  index('progress_student_id_idx').on(table.studentId),
  index('progress_lecture_id_idx').on(table.lectureId),
  {
    uniqueStudentLecture: {
      columns: [table.studentId, table.lectureId],
    },
  },
]);

export type Progress = InferSelectModel<typeof progress>;
