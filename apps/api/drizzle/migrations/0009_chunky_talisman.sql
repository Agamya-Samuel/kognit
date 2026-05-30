CREATE TYPE "public"."email_verification_purpose" AS ENUM('email_verify', 'student_activation');--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"student_id" integer NOT NULL,
	"content" text,
	"score" integer,
	"feedback" text,
	"graded_at" timestamp,
	"submitted_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_verifications" DROP CONSTRAINT "email_verifications_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "email_verifications" ALTER COLUMN "token_hash" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "approval_status" "approval_status" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "mobile" varchar(20);--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "state" varchar(100);--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "pin_code" varchar(10);--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "country" varchar(100);--> statement-breakpoint
ALTER TABLE "student_profiles" ADD COLUMN "affiliated_institute_id" integer;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD COLUMN "purpose" "email_verification_purpose" DEFAULT 'email_verify' NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "submissions_assignment_id_idx" ON "submissions" USING btree ("assignment_id");--> statement-breakpoint
CREATE INDEX "submissions_student_id_idx" ON "submissions" USING btree ("student_id");--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_affiliated_institute_id_institution_accounts_id_fk" FOREIGN KEY ("affiliated_institute_id") REFERENCES "public"."institution_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_approval_status_idx" ON "users" USING btree ("approval_status");--> statement-breakpoint
CREATE INDEX "users_onboarding_completed_idx" ON "users" USING btree ("onboarding_completed");--> statement-breakpoint
CREATE INDEX "student_profiles_affiliated_institute_id_idx" ON "student_profiles" USING btree ("affiliated_institute_id");--> statement-breakpoint
CREATE INDEX "email_verifications_purpose_idx" ON "email_verifications" USING btree ("purpose");