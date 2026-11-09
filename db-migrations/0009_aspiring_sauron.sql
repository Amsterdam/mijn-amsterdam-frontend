CREATE TABLE "bff_service_alert_links" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"service_alert_id" varchar(64) NOT NULL,
	"label" varchar(200) NOT NULL,
	"url" varchar(2048) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bff_service_alerts" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"type" varchar(20) DEFAULT 'info' NOT NULL,
	"display_locations" varchar(20)[] DEFAULT '{}' NOT NULL,
	"environments" varchar(10)[] DEFAULT '{}' NOT NULL,
	"date_start" timestamp with time zone NOT NULL,
	"date_end" timestamp with time zone,
	"date_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"date_created" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bff_service_alert_links" ADD CONSTRAINT "bff_service_alert_links_service_alert_id_bff_service_alerts_id_fk" FOREIGN KEY ("service_alert_id") REFERENCES "public"."bff_service_alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bff_service_alert_links_service_alert_id_idx" ON "bff_service_alert_links" USING btree ("service_alert_id");--> statement-breakpoint
CREATE INDEX "bff_service_alerts_date_start_end_idx" ON "bff_service_alerts" USING btree ("date_start","date_end");--> statement-breakpoint
CREATE INDEX "bff_service_alerts_environments_gin_idx" ON "bff_service_alerts" USING gin ("environments");--> statement-breakpoint
CREATE INDEX "bff_service_alerts_display_locations_gin_idx" ON "bff_service_alerts" USING gin ("display_locations");