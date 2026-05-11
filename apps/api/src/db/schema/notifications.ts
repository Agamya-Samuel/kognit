import { pgTable, serial, integer, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { users } from './users';
import { notificationDelivery } from './enums';

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  type: varchar('type', { length: 100 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body'),
  isRead: boolean('is_read').notNull().default(false),
  deliveredVia: notificationDelivery('delivered_via').notNull().default('in_app'),
  emailSentAt: timestamp('email_sent_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
