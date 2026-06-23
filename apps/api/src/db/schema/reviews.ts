import { pgTable, serial, integer, text, timestamp, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
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
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('reviews_course_id_idx').on(table.courseId),
  index('reviews_user_id_idx').on(table.userId),
  index('reviews_course_moderation_idx').on(table.courseId, table.moderationStatus),
  index('reviews_deleted_at_idx').on(table.deletedAt),
  {
    uniqueUserCourse: {
      columns: [table.userId, table.courseId],
    },
  },
]);

export type Review = InferSelectModel<typeof reviews>;
