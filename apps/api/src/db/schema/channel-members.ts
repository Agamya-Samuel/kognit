import { pgTable, serial, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { channels } from './channels';
import { users } from './users';

export const channelMembers = pgTable('channel_members', {
  id: serial('id').primaryKey(),
  channelId: integer('channel_id').notNull().references(() => channels.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
  lastReadAt: timestamp('last_read_at'),
}, (table) => [
  uniqueIndex('channel_members_unique').on(table.channelId, table.userId),
]);

export type ChannelMember = InferSelectModel<typeof channelMembers>;
