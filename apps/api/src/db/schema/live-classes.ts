import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { lectures } from './lectures';
import { users } from './users';
import { liveClassStatus } from './enums';

export const liveClasses = pgTable('live_classes', {
  id: serial('id').primaryKey(),
  lectureId: integer('lecture_id').notNull().references(() => lectures.id, { onDelete: 'restrict' }),
  instructorId: integer('instructor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  scheduledAt: timestamp('scheduled_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  livekitRoomName: varchar('livekit_room_name', { length: 255 }).notNull(),
  recordingUrl: varchar('recording_url', { length: 500 }),
  status: liveClassStatus('status').notNull().default('scheduled'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type LiveClass = InferSelectModel<typeof liveClasses>;
