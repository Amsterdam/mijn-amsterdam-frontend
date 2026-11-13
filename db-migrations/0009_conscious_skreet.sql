CREATE TABLE "bff_service_alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text NOT NULL,
	"type" varchar(20) NOT NULL,
	"display_location" varchar(20) NOT NULL,
	"thema_id" varchar(64),
	"created_by_email" varchar(320) NOT NULL,
	"updated_by_email" varchar(320) NOT NULL,
	"links" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"date_start" timestamp with time zone NOT NULL,
	"date_end" timestamp with time zone NOT NULL,
	"date_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"date_created" timestamp with time zone DEFAULT now() NOT NULL
);
