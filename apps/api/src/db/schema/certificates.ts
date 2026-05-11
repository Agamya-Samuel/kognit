import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { courses } from './courses';

export const certificates = pgTable('certificates', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  certificateUid: varchar('certificate_uid', { length: 100 }).notNull().unique(),
  issuedAt: timestamp('issued_at').notNull().defaultNow(),
  pdfUrl: varchar('pdf_url', { length: 500 }),
}, (table) => ({
  uniqueStudentCourse: {
    columns: [table.studentId, table.courseId],
  },
}));

export type Certificate = InferSelectModel<typeof certificates>;
