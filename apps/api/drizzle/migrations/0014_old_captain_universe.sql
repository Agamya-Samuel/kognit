ALTER TABLE "sections" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "lectures" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "reviews" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE INDEX "sections_deleted_at_idx" ON "sections" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "lectures_deleted_at_idx" ON "lectures" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "assignments_deleted_at_idx" ON "assignments" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_notification_preferences_user_id_idx" ON "user_notification_preferences" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reviews_deleted_at_idx" ON "reviews" USING btree ("deleted_at");