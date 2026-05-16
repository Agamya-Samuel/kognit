import { pgTable, serial, integer, text, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';

export const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  resumeUrl: varchar('resume_url', { length: 500 }),
  skills: text('skills').array().notNull().default([]),
  placementStatus: text('placement_status'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('student_profiles_user_id_idx').on(table.userId),
]);

export type StudentProfile = InferSelectModel<typeof studentProfiles>;
