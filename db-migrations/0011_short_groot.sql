DROP INDEX "bff_service_alerts_environments_gin_idx";--> statement-breakpoint
ALTER TABLE "bff_service_alerts" ALTER COLUMN "environments" SET DATA TYPE varchar(10) USING COALESCE("environments"[1], 'test');--> statement-breakpoint
ALTER TABLE "bff_service_alerts" ALTER COLUMN "environments" DROP DEFAULT;--> statement-breakpoint
CREATE INDEX "bff_service_alerts_environment_idx" ON "bff_service_alerts" USING btree ("environments");