import { pgTable, serial, integer, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { courses } from './courses';
import { payments } from './payments';
import { accessType } from './enums';

export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
  paymentId: integer('payment_id').references(() => payments.id, { onDelete: 'set null' }),
  accessType: accessType('access_type').notNull().default('purchased'),
}, (table) => [
  index('enrollments_student_id_idx').on(table.studentId),
  index('enrollments_course_id_idx').on(table.courseId),
  {
    uniqueStudentCourse: {
      columns: [table.studentId, table.courseId],
    },
  },
]);

export type Enrollment = InferSelectModel<typeof enrollments>;
