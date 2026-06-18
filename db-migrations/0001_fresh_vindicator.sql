CREATE INDEX IF NOT EXISTS "bff_notifications_date_created_idx" ON "bff_notifications" USING btree ("date_created");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bff_notifications_consumer_ids_gin_idx" ON "bff_notifications" USING gin ("consumer_ids");
