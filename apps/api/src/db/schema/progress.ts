import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { lectures } from './lectures';

export const progress = pgTable('progress', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  lectureId: integer('lecture_id').notNull().references(() => lectures.id, { onDelete: 'restrict' }),
  watchedSeconds: integer('watched_seconds').notNull().default(0),
  lastWatchedAt: timestamp('last_watched_at').notNull().defaultNow(),
}, (table) => ({
  uniqueStudentLecture: {
    columns: [table.studentId, table.lectureId],
  },
}));
