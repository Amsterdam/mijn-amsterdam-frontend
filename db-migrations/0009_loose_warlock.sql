CREATE TABLE "bff_service_alerts" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"type" varchar(20) DEFAULT 'info' NOT NULL,
	"display_location" varchar(20) NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"environments" varchar(10)[] DEFAULT '{}' NOT NULL,
	"date_start" timestamp with time zone NOT NULL,
	"date_end" timestamp with time zone,
	"date_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"date_created" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "bff_service_alerts_date_start_end_idx" ON "bff_service_alerts" USING btree ("date_start","date_end");--> statement-breakpoint
CREATE INDEX "bff_service_alerts_environments_gin_idx" ON "bff_service_alerts" USING gin ("environments");