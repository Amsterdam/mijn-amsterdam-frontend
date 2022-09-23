DROP TABLE IF EXISTS "public"."prod_login_count";

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS prod_login_count_id_seq;

-- Table Definition
CREATE TABLE "public"."prod_login_count" (
    "id" int4 NOT NULL DEFAULT nextval('prod_login_count_id_seq'::regclass),
    "uid" varchar(100) NOT NULL,
    "date_created" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."dev_login_count";

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS dev_login_count_id_seq;

-- Table Definition
CREATE TABLE "public"."dev_login_count" (
    "id" int4 NOT NULL DEFAULT nextval('dev_login_count_id_seq'::regclass),
    "uid" varchar(100) NOT NULL,
    "date_created" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "public"."acc_login_count";

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS acc_login_count_id_seq;

-- Table Definition
CREATE TABLE "public"."acc_login_count" (
    "id" int4 NOT NULL DEFAULT nextval('acc_login_count_id_seq'::regclass),
    "uid" varchar(100) NOT NULL,
    "date_created" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);

