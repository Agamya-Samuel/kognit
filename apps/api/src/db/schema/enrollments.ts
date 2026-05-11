import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
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
}, (table) => ({
  uniqueStudentCourse: {
    columns: [table.studentId, table.courseId],
  },
}));
