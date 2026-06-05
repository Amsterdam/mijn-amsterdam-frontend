CREATE TABLE "bff_notification_consumer_details" (
	"consumer_id" varchar(100) PRIMARY KEY NOT NULL,
	"notification_row_id" varchar(64) NOT NULL,
	"login_expiry_date" timestamp with time zone DEFAULT NOW() + INTERVAL '3 months' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bff_notifications"
ALTER COLUMN "last_login_date"
SET DATA TYPE timestamp with time zone
USING NULL::timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bff_notification_consumer_details" ADD CONSTRAINT "bff_notification_consumer_details_notification_row_id_bff_notifications_id_fk" FOREIGN KEY ("notification_row_id") REFERENCES "public"."bff_notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bff_notification_consumer_details_notification_row_id_idx" ON "bff_notification_consumer_details" USING btree ("notification_row_id");--> statement-breakpoint
CREATE INDEX "bff_notification_consumer_details_login_expiry_date_idx" ON "bff_notification_consumer_details" USING btree ("login_expiry_date");

-- Backfill consumerDetails with consumerIds and login_expiry_date
WITH expanded_consumers AS (
  SELECT
    unnest("consumer_ids") AS "consumer_id",
    "id" AS "notification_row_id",
    "date_updated"
  FROM "bff_notifications"
  WHERE "consumer_ids" IS NOT NULL
    AND array_length("consumer_ids", 1) > 0
),
latest_consumer_rows AS (
  SELECT DISTINCT ON ("consumer_id")
    "consumer_id",
    "notification_row_id"
  FROM expanded_consumers
  ORDER BY "consumer_id", "date_updated" DESC
)
INSERT INTO "bff_notification_consumer_details" (
  "consumer_id",
  "notification_row_id",
  "login_expiry_date"
)
SELECT
  "consumer_id",
  "notification_row_id",
  NOW() + INTERVAL '3 months'
FROM latest_consumer_rows
ON CONFLICT ("consumer_id") DO NOTHING;--> statement-breakpoint

