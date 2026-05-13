import { pgTable, serial, integer, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { channels } from './channels';
import { users } from './users';
import { moderationStatus } from './enums';

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').notNull().references(() => channels.id, { onDelete: 'restrict' }),
  senderId: integer('sender_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  content: text('content').notNull(),
  replyToId: integer('reply_to_id'),
  isEdited: boolean('is_edited').notNull().default(false),
  isDeleted: boolean('is_deleted').notNull().default(false),
  moderationStatus: moderationStatus('moderation_status').notNull().default('visible'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Message = InferSelectModel<typeof messages>;
