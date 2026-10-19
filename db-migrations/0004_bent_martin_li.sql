CREATE TABLE "user_feedback_meta" (
	"id" serial PRIMARY KEY NOT NULL,
	"entry_id" integer NOT NULL,
	"date_created" timestamp with time zone DEFAULT now() NOT NULL,
	"routed_by_email" varchar(320) NOT NULL,
	"jira_ticket_number" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "user_feedback_meta_entry_id_unique" ON "user_feedback_meta" USING btree ("entry_id");