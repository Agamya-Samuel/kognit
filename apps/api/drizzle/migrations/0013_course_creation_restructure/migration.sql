-- Custom migration: Course creation restructure
-- Step 1: Create new enums
DO $$ BEGIN
 CREATE TYPE "public"."course_status" AS ENUM('draft', 'in_review', 'revision_requested', 'published', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."course_structure" AS ENUM('live', 'normal');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."session_type" AS ENUM('one_time', 'recurring');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "public"."day_of_week" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add new columns to courses table
ALTER TABLE "courses" ADD COLUMN "course_structure" "course_structure" NOT NULL DEFAULT 'normal';
ALTER TABLE "courses" ADD COLUMN "status" "course_status" NOT NULL DEFAULT 'draft';
ALTER TABLE "courses" ADD COLUMN "revision_notes" text;

-- Map existing is_published to status: true -> 'published', false -> 'draft'
UPDATE "courses" SET "status" = 'published' WHERE "is_published" = true;
UPDATE "courses" SET "status" = 'draft' WHERE "is_published" = false;

-- Drop old is_published column and its index
DROP INDEX IF EXISTS "courses_is_published_idx";
ALTER TABLE "courses" DROP COLUMN IF EXISTS "is_published";

-- Add new indexes on courses
CREATE INDEX IF NOT EXISTS "courses_status_idx" ON "courses" USING btree ("status");
CREATE INDEX IF NOT EXISTS "courses_course_structure_idx" ON "courses" USING btree ("course_structure");

-- Step 3: Add description to sections
ALTER TABLE "sections" ADD COLUMN "description" text;

-- Step 4: Add video columns to lectures
ALTER TABLE "lectures" ADD COLUMN "video_url" varchar(500);
ALTER TABLE "lectures" ADD COLUMN "external_video_url" varchar(500);

-- Step 5: Restructure live_classes table
-- First, drop old FK and indexes referencing lectures
ALTER TABLE "live_classes" DROP CONSTRAINT IF EXISTS "live_classes_lecture_id_lectures_id_fk";
DROP INDEX IF EXISTS "live_classes_lecture_id_idx";

-- Drop the old lecture_id column
ALTER TABLE "live_classes" DROP COLUMN IF EXISTS "lecture_id";

-- Add new columns to live_classes
ALTER TABLE "live_classes" ADD COLUMN "course_id" integer NOT NULL DEFAULT 1 REFERENCES "courses"("id") ON DELETE restrict;
ALTER TABLE "live_classes" ADD COLUMN "recurring_schedule_id" integer;
ALTER TABLE "live_classes" ADD COLUMN "session_type" "session_type" NOT NULL DEFAULT 'one_time';
ALTER TABLE "live_classes" ADD COLUMN "title" varchar(255) NOT NULL DEFAULT 'Untitled Session';
ALTER TABLE "live_classes" ADD COLUMN "description" text;
ALTER TABLE "live_classes" ADD COLUMN "meeting_link" varchar(500);
ALTER TABLE "live_classes" ADD COLUMN "recording_available" boolean NOT NULL DEFAULT true;
ALTER TABLE "live_classes" ADD COLUMN "updated_at" timestamp NOT NULL DEFAULT now();

-- Add new indexes for live_classes
CREATE INDEX IF NOT EXISTS "live_classes_course_id_idx" ON "live_classes" USING btree ("course_id");
CREATE INDEX IF NOT EXISTS "live_classes_recurring_schedule_id_idx" ON "live_classes" USING btree ("recurring_schedule_id");

-- Step 6: Create recurring_schedules table
CREATE TABLE IF NOT EXISTS "recurring_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL REFERENCES "courses"("id") ON DELETE restrict,
	"title" varchar(255) NOT NULL,
	"days_of_week" text NOT NULL,
	"start_time" time NOT NULL,
	"duration_minutes" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"meeting_link" varchar(500),
	"livekit_room_prefix" varchar(255),
	"created_at" timestamp NOT NULL DEFAULT now(),
	"updated_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "recurring_schedules_course_id_idx" ON "recurring_schedules" USING btree ("course_id");

-- Step 7: Create lesson_attachments table
CREATE TABLE IF NOT EXISTS "lesson_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"lecture_id" integer NOT NULL REFERENCES "lectures"("id") ON DELETE restrict,
	"file_name" varchar(255) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"content_type" varchar(100),
	"file_size" integer,
	"order_index" integer NOT NULL DEFAULT 0,
	"created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "lesson_attachments_lecture_id_idx" ON "lesson_attachments" USING btree ("lecture_id");
