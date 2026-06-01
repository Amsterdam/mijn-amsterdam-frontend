CREATE TABLE "bff_notification_consumer_details" (
	"consumer_id" varchar(100) PRIMARY KEY NOT NULL,
	"notification_row_id" varchar(64) NOT NULL,
	"login_expiry_date" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "bff_notification_consumer_details" ADD CONSTRAINT "bff_notification_consumer_details_notification_row_id_bff_notifications_id_fk" FOREIGN KEY ("notification_row_id") REFERENCES "public"."bff_notifications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bff_notification_consumer_details_notification_row_id_idx" ON "bff_notification_consumer_details" USING btree ("notification_row_id");--> statement-breakpoint
CREATE INDEX "bff_notification_consumer_details_login_expiry_date_idx" ON "bff_notification_consumer_details" USING btree ("login_expiry_date");