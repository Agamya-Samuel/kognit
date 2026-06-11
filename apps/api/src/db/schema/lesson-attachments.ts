import { pgTable, serial, integer, timestamp, varchar, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { lectures } from './lectures';

export const lessonAttachments = pgTable('lesson_attachments', {
  id: serial('id').primaryKey(),
  lectureId: integer('lecture_id').notNull().references(() => lectures.id, { onDelete: 'restrict' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  contentType: varchar('content_type', { length: 100 }),
  fileSize: integer('file_size'),
  orderIndex: integer('order_index').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('lesson_attachments_lecture_id_idx').on(table.lectureId),
]);

export type LessonAttachment = InferSelectModel<typeof lessonAttachments>;
