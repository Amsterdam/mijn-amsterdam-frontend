-- This script is the base create query for a table that can be used with visitor login count overview. Change `login_count_table_name` accordingly.
DROP TABLE IF EXISTS "public"."login_count_table_name";
-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS login_count_table_name_id_seq;

-- Table Definition
CREATE TABLE "public"."login_count_table_name" (
    "id" int4 NOT NULL DEFAULT nextval('acc_login_count_id_seq'::regclass),
    "uid" varchar(100) NOT NULL,
    "date_created" timestamp NOT NULL DEFAULT now(),
    "authMethod" varchar(100),
    PRIMARY KEY ("id")
);
