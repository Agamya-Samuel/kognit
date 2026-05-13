CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"assignment_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"options" text NOT NULL,
	"correct_option_index" integer NOT NULL,
	"points" integer DEFAULT 1 NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "late_window_hours" integer;--> statement-breakpoint
ALTER TABLE "assignments" ADD COLUMN "late_penalty_percent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;