ALTER TABLE "bff_notifications"
ALTER COLUMN "last_login_date"
SET DATA TYPE timestamp with time zone
USING CASE
  WHEN "last_login_date" IS NULL THEN NULL
  ELSE "last_login_date"::timestamp with time zone
END;
