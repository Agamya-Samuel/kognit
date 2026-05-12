import { pgTable, serial, integer, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { sections } from './sections';
import { lectureType } from './enums';

export const lectures = pgTable('lectures', {
  id: serial('id').primaryKey(),
  sectionId: integer('section_id').notNull().references(() => sections.id, { onDelete: 'restrict' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  orderIndex: integer('order_index').notNull().default(0),
  type: lectureType('type').notNull().default('video'),
  uploadId: integer('upload_id'),
  muxAssetId: varchar('mux_asset_id', { length: 255 }),
  muxPlaybackId: varchar('mux_playback_id', { length: 255 }),
  durationSeconds: integer('duration_seconds').notNull().default(0),
  isFreePreview: boolean('is_free_preview').notNull().default(false),
  isPublished: boolean('is_published').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Lecture = InferSelectModel<typeof lectures>;
