UPDATE "bff_service_alerts" SET "date_end" = "date_start" WHERE "date_end" IS NULL;--> statement-breakpoint
ALTER TABLE "bff_service_alerts" ALTER COLUMN "date_end" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bff_service_alerts" ADD COLUMN "thema_id" varchar(64);--> statement-breakpoint
ALTER TABLE "bff_service_alerts" ADD COLUMN "created_by_email" varchar(320);--> statement-breakpoint
ALTER TABLE "bff_service_alerts" ADD COLUMN "updated_by_email" varchar(320);