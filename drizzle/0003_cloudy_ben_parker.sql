ALTER TABLE "bff_notification_consumer_details" ALTER COLUMN "login_expiry_date"
 SET DEFAULT NOW() + INTERVAL '3 months';--> statement-breakpoint

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

DROP INDEX "bff_notifications_consumer_ids_gin_idx";--> statement-breakpoint
ALTER TABLE "bff_notifications" DROP COLUMN "consumer_ids";
