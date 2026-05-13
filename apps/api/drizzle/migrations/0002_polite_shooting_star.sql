CREATE TYPE "public"."recording_status" AS ENUM('none', 'recording', 'processing', 'ready', 'failed');--> statement-breakpoint
ALTER TYPE "public"."live_class_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "recording_status" "recording_status" DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "recording_mux_asset_id" varchar(255);--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "recording_mux_playback_id" varchar(255);--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "recording_s3_key" varchar(500);--> statement-breakpoint
ALTER TABLE "live_classes" ADD COLUMN "recording_error" text;--> statement-breakpoint
ALTER TABLE "progress" ADD COLUMN "is_completed" boolean DEFAULT false NOT NULL;