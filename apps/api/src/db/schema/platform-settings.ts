import { pgTable, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';

export const platformSettings = pgTable('platform_settings', {
  id: varchar('id', { length: 100 }).primaryKey(),
  value: varchar('value', { length: 1000 }).notNull(),
  description: varchar('description', { length: 255 }),
  updatedBy: varchar('updated_by', { length: 100 }),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('platform_settings_id_idx').on(table.id),
]);

export type PlatformSetting = InferSelectModel<typeof platformSettings>;