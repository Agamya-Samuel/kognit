ALTER TABLE "notifications" ADD COLUMN "job_id" varchar(255);--> statement-breakpoint
ALTER TABLE "notifications" ADD COLUMN "sms_sent_at" timestamp;