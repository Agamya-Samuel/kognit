CREATE TABLE "platform_settings" (
	"id" varchar(100) PRIMARY KEY NOT NULL,
	"value" varchar(1000) NOT NULL,
	"description" varchar(255),
	"updated_by" varchar(100),
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "platform_settings_id_idx" ON "platform_settings" USING btree ("id");