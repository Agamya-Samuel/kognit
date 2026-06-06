ALTER TABLE "user_notification_preferences" ADD COLUMN "sms_enrollments" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD COLUMN "sms_submissions" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD COLUMN "sms_reminders" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD COLUMN "email_frequency" varchar(20) DEFAULT 'immediate' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_notification_preferences" ADD COLUMN "sms_frequency" varchar(20) DEFAULT 'immediate' NOT NULL;