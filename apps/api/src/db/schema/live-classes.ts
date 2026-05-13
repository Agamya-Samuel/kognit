import { pgTable, serial, integer, timestamp, varchar, text } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { lectures } from './lectures';
import { users } from './users';
import { liveClassStatus, recordingStatus } from './enums';

export const liveClasses = pgTable('live_classes', {
  id: serial('id').primaryKey(),
  lectureId: integer('lecture_id').notNull().references(() => lectures.id, { onDelete: 'restrict' }),
  instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  scheduledAt: timestamp('scheduled_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  livekitRoomName: varchar('livekit_room_name', { length: 255 }).notNull(),
  recordingUrl: varchar('recording_url', { length: 500 }),
  recordingStatus: recordingStatus('recording_status').notNull().default('none'),
  recordingMuxAssetId: varchar('recording_mux_asset_id', { length: 255 }),
  recordingMuxPlaybackId: varchar('recording_mux_playback_id', { length: 255 }),
  recordingS3Key: varchar('recording_s3_key', { length: 500 }),
  recordingError: text('recording_error'),
  status: liveClassStatus('status').notNull().default('scheduled'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type LiveClass = InferSelectModel<typeof liveClasses>;
