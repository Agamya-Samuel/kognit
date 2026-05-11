import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core';
import { institutionAccounts } from './institution-accounts';
import { users } from './users';
import { courses } from './courses';

export const institutionEnrollments = pgTable('institution_enrollments', {
  id: serial('id').primaryKey(),
  institutionAccountId: integer('institution_account_id').notNull().references(() => institutionAccounts.id, { onDelete: 'restrict' }),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
}, (table) => ({
  uniqueInstitutionStudentCourse: {
    columns: [table.institutionAccountId, table.studentId, table.courseId],
  },
}));
