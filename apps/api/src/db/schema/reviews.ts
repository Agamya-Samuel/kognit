import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';
import { moderationStatus } from './enums';

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  moderationStatus: moderationStatus('moderation_status').notNull().default('visible'),
  flaggedAt: timestamp('flagged_at'),
  moderatedBy: integer('moderated_by').references(() => users.id, { onDelete: 'set null' }),
  moderatedAt: timestamp('moderated_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uniqueUserCourse: {
    columns: [table.userId, table.courseId],
  },
}));
