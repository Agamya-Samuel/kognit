import { pgTable, serial, integer, text, timestamp, varchar, bigint, boolean, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';
import { lectures } from './lectures';
import { uploadStatus } from './enums';

export const uploads = pgTable('uploads', {
  id: serial('id').primaryKey(),
  lectureId: integer('lecture_id').notNull().references(() => lectures.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 500 }).notNull(),
  fileKey: varchar('file_key', { length: 500 }).notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  status: uploadStatus('status').notNull().default('pending'),
  uploadUrl: text('upload_url'),
  expiresAt: timestamp('expires_at'),
  uploadedAt: timestamp('uploaded_at'),
  errorMessage: text('error_message'),
  checksum: varchar('checksum', { length: 255 }),
  validationPassed: boolean('validation_passed').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('uploads_lecture_id_idx').on(table.lectureId),
  index('uploads_user_id_idx').on(table.userId),
  index('uploads_status_idx').on(table.status),
]);

export type Upload = InferSelectModel<typeof uploads>;
