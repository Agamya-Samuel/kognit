import { pgTable, serial, integer, timestamp, varchar, text, boolean, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { courses } from './courses';
import { users } from './users';
import { liveClassStatus, recordingStatus, sessionType } from './enums';

export const liveClasses = pgTable('live_classes', {
  id: serial('id').primaryKey(),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  recurringScheduleId: integer('recurring_schedule_id'),
  sessionType: sessionType('session_type').notNull().default('one_time'),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  meetingLink: varchar('meeting_link', { length: 500 }),
  livekitRoomName: varchar('livekit_room_name', { length: 255 }).notNull(),
  recordingUrl: varchar('recording_url', { length: 500 }),
  recordingStatus: recordingStatus('recording_status').notNull().default('none'),
  recordingMuxAssetId: varchar('recording_mux_asset_id', { length: 255 }),
  recordingMuxPlaybackId: varchar('recording_mux_playback_id', { length: 255 }),
  recordingS3Key: varchar('recording_s3_key', { length: 500 }),
  recordingError: text('recording_error'),
  recordingAvailable: boolean('recording_available').notNull().default(true),
  status: liveClassStatus('status').notNull().default('scheduled'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => [
  index('live_classes_course_id_idx').on(table.courseId),
  index('live_classes_instructor_id_idx').on(table.instructorId),
  index('live_classes_status_idx').on(table.status),
  index('live_classes_status_scheduled_at_idx').on(table.status, table.scheduledAt),
  index('live_classes_recording_status_idx').on(table.recordingStatus),
  index('live_classes_recurring_schedule_id_idx').on(table.recurringScheduleId),
]);

export type LiveClass = InferSelectModel<typeof liveClasses>;
