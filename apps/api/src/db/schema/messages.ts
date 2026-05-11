import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { channels } from './channels';
import { users } from './users';

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').notNull().references(() => channels.id, { onDelete: 'restrict' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export type Message = InferSelectModel<typeof messages>;
