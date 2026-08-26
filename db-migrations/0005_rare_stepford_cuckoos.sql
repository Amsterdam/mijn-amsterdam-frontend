ALTER TABLE "user_feedback_meta" ALTER COLUMN "jira_ticket_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_feedback_meta" ADD COLUMN "department_name" varchar(255);--> statement-breakpoint
ALTER TABLE "user_feedback_meta" ADD COLUMN "department_email" varchar(320);--> statement-breakpoint
ALTER TABLE "user_feedback_meta" ADD COLUMN "cc_email" varchar(320);