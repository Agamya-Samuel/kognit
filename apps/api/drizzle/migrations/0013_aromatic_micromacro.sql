CREATE TYPE "public"."course_status" AS ENUM('draft', 'in_review', 'revision_requested', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."course_structure" AS ENUM('live', 'normal');--> statement-breakpoint
CREATE TYPE "public"."day_of_week" AS ENUM('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('one_time', 'recurring');--> statement-breakpoint
CREATE TABLE "recurring_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"days_of_week" text NOT NULL,
	"start_time" time NOT NULL,
	"duration_minutes" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"meeting_link" varchar(500),
	"livekit_room_prefix" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lesson_attachments" (
	"id" serial PRIMARY KEY NOT NULL,
	"lecture_id" integer NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_url" varchar(500) NOT NULL,
	"content_type" varchar(100),
	"file_size" integer,
	"order_index" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "live_classes" DROP CONSTRAINT "live_classes_lecture_id_lectures_id_fk";
--> statement-breakpoint
DROP INDEX "courses_is_published_idx";--> statement-breakpoint
DROP INDEX "live_classes_lecture_id_idx";--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "course_structure" "course_structure" NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "status" "course_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "revision_notes" text;--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "course_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "recurring_schedule_id" integer;--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "session_type" "session_type" DEFAULT 'one_time' NOT NULL;--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "title" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "meeting_link" varchar(500);--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "recording_available" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sections" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "lectures" ADD COLUMN "video_url" varchar(500);--> statement-breakpoint
ALTER TABLE "lectures" ADD COLUMN "external_video_url" varchar(500);--> statement-breakpoint
ALTER TABLE "recurring_schedules" ADD CONSTRAINT "recurring_schedules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_attachments" ADD CONSTRAINT "lesson_attachments_lecture_id_lectures_id_fk" FOREIGN KEY ("lecture_id") REFERENCES "public"."lectures"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recurring_schedules_course_id_idx" ON "recurring_schedules" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "lesson_attachments_lecture_id_idx" ON "lesson_attachments" USING btree ("lecture_id");--> statement-breakpoint
ALTER TABLE "live_classes" ADD CONSTRAINT "live_classes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "courses_status_idx" ON "courses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "courses_course_structure_idx" ON "courses" USING btree ("course_structure");--> statement-breakpoint
CREATE INDEX "live_classes_course_id_idx" ON "live_classes" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "live_classes_recurring_schedule_id_idx" ON "live_classes" USING btree ("recurring_schedule_id");--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "is_published";--> statement-breakpoint
ALTER TABLE "live_classes" DROP COLUMN "lecture_id";