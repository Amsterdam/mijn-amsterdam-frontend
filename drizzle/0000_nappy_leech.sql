CREATE TABLE "bff_notifications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"profile_id" varchar(43) NOT NULL,
	"profile_name" varchar(200),
	"consumer_ids" varchar(100)[] DEFAULT '{}' NOT NULL,
	"service_ids" varchar(50)[] DEFAULT '{}' NOT NULL,
	"content" jsonb,
	"date_updated" timestamp with time zone DEFAULT now() NOT NULL,
	"date_created" timestamp with time zone DEFAULT now() NOT NULL,
	"last_login_date" varchar(200)
);
