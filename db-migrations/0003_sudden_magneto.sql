CREATE TABLE "bff_admin_accounts" (
	"username" varchar(320) PRIMARY KEY NOT NULL,
	"jira_api_token" varchar(512) DEFAULT '' NOT NULL,
	"last_sign_in_date" timestamp with time zone DEFAULT now() NOT NULL
);
