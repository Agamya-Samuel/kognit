import { pgTable, serial, integer, timestamp, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { institutionAccounts } from './institution-accounts';
import { users } from './users';
import { courses } from './courses';

export const institutionEnrollments = pgTable('institution_enrollments', {
  id: serial('id').primaryKey(),
  institutionAccountId: integer('institution_account_id').notNull().references(() => institutionAccounts.id, { onDelete: 'restrict' }),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
}, (table) => [
  index('institution_enrollments_account_id_idx').on(table.institutionAccountId),
  index('institution_enrollments_student_id_idx').on(table.studentId),
  index('institution_enrollments_course_id_idx').on(table.courseId),
  {
    uniqueInstitutionStudentCourse: {
      columns: [table.institutionAccountId, table.studentId, table.courseId],
    },
  },
]);

export type InstitutionEnrollment = InferSelectModel<typeof institutionEnrollments>;
