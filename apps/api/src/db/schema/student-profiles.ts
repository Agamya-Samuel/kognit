import { pgTable, serial, integer, text, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { institutionAccounts } from './institution-accounts';

export const studentProfiles = pgTable('student_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  resumeUrl: varchar('resume_url', { length: 500 }),
  skills: text('skills').array().notNull().default([]),
  placementStatus: text('placement_status'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  // Extended profile fields for student onboarding
  mobile: varchar('mobile', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  pinCode: varchar('pin_code', { length: 10 }),
  country: varchar('country', { length: 100 }),
  affiliatedInstituteId: integer('affiliated_institute_id').references(() => institutionAccounts.id, { onDelete: 'set null' }),
}, (table) => [
  index('student_profiles_user_id_idx').on(table.userId),
  index('student_profiles_affiliated_institute_id_idx').on(table.affiliatedInstituteId),
]);

export type StudentProfile = InferSelectModel<typeof studentProfiles>;
