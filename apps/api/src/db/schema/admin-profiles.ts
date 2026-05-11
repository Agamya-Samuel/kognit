import { pgTable, serial, integer, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { permissionsLevel } from './enums';

export const adminProfiles = pgTable('admin_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  department: varchar('department', { length: 255 }),
  permissionsLevel: permissionsLevel('permissions_level').notNull().default('support'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type AdminProfile = InferSelectModel<typeof adminProfiles>;
