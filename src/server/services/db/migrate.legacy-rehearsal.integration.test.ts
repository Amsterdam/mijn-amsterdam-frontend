import type { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { runMigrations } from './migrate.ts';
import { setupPgTestDb, truncatePgSchemaTables } from './pg-test-utils.ts';

// TODO: REMOVE TEMPORARY TEST: Can be removed after succesful deployment and verification of the migration in production.

const RUN_DB_TESTS = process.env.RUN_DB_TESTS === 'true';
const describePg = RUN_DB_TESTS ? describe : describe.skip;

async function seedLegacyNotificationsSchema(pool: Pool) {
  await pool.query(`
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
    )
  `);

  await pool.query(
    'CREATE INDEX "bff_notifications_date_created_idx" ON "bff_notifications" USING btree ("date_created")'
  );

  await pool.query(
    'CREATE INDEX "bff_notifications_consumer_ids_gin_idx" ON "bff_notifications" USING gin ("consumer_ids")'
  );
}

async function seedLegacyNotificationsData(pool: Pool) {
  await pool.query(
    `
      INSERT INTO "bff_notifications" (
        "id",
        "profile_id",
        "profile_name",
        "consumer_ids",
        "service_ids",
        "date_updated",
        "date_created",
        "last_login_date"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
    `,
    [
      'row-old',
      'profile1_id',
      'Legacy Old',
      ['consumer-shared', 'consumer-old'],
      ['afis'],
      '2020-01-01T00:00:00.000Z',
      '2020-01-01T00:00:00.000Z',
    ]
  );

  await pool.query(
    `
      INSERT INTO "bff_notifications" (
        "id",
        "profile_id",
        "profile_name",
        "consumer_ids",
        "service_ids",
        "date_updated",
        "date_created",
        "last_login_date"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
    `,
    [
      'row-new',
      'profile2_id',
      'Legacy New',
      ['consumer-shared', 'consumer-new'],
      ['avg'],
      '2020-01-03T00:00:00.000Z',
      '2020-01-03T00:00:00.000Z',
    ]
  );

  await pool.query(
    `
      INSERT INTO "bff_notifications" (
        "id",
        "profile_id",
        "profile_name",
        "consumer_ids",
        "service_ids",
        "date_updated",
        "date_created",
        "last_login_date"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
    `,
    [
      'row-empty',
      'profile3_id',
      'Legacy Empty',
      [],
      ['afis'],
      '2020-01-02T00:00:00.000Z',
      null,
    ]
  );
}

describePg('drizzle migrations legacy rehearsal (postgres integration)', () => {
  let pool: Pool;
  let teardown: (() => Promise<void>) | undefined;

  beforeAll(async () => {
    const ctx = await setupPgTestDb({
      databaseName: 'mijnadam_legacy_rehearsal_test',
      envOverrides: { BFF_DB_ENABLED: 'true' },
    });

    pool = ctx.pool;
    teardown = ctx.teardown;
  }, 120_000);

  afterAll(async () => {
    try {
      if (pool) {
        await truncatePgSchemaTables(pool);
      }
    } finally {
      await teardown?.();
    }
  }, 60_000);

  it('upgrades a pre-Drizzle legacy schema and keeps migrations idempotent', async () => {
    await seedLegacyNotificationsSchema(pool);
    await seedLegacyNotificationsData(pool);

    await runMigrations();

    const consumerDetailsRows = await pool.query<{
      consumer_id: string;
      notification_row_id: string;
      login_expiry_date: Date | null;
    }>(`
      SELECT
        "consumer_id",
        "notification_row_id",
        "login_expiry_date"
      FROM "bff_notification_consumer_details"
      ORDER BY "consumer_id"
    `);

    expect(consumerDetailsRows.rows).toHaveLength(3);
    expect(consumerDetailsRows.rows).toMatchObject([
      {
        consumer_id: 'consumer-new',
        notification_row_id: 'row-new',
      },
      {
        consumer_id: 'consumer-old',
        notification_row_id: 'row-old',
      },
      {
        consumer_id: 'consumer-shared',
        notification_row_id: 'row-new',
      },
    ]);

    for (const row of consumerDetailsRows.rows) {
      expect(row.login_expiry_date).toBeInstanceOf(Date);
    }

    const insertedWithDefault = await pool.query<{ login_expiry_date: Date }>(
      `
        INSERT INTO "bff_notification_consumer_details" (
          "consumer_id",
          "notification_row_id"
        )
        VALUES ($1, $2)
        RETURNING "login_expiry_date"
      `,
      ['consumer-default', 'row-old']
    );

    expect(insertedWithDefault.rows[0]?.login_expiry_date).toBeInstanceOf(Date);

    const legacyColumnCheck = await pool.query<{ count: string }>(`
      SELECT COUNT(*)::text AS "count"
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bff_notifications'
        AND column_name = 'consumer_ids'
    `);

    expect(Number(legacyColumnCheck.rows[0]?.count ?? '0')).toBe(0);

    const lastLoginDateTypeCheck = await pool.query<{ data_type: string }>(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bff_notifications'
        AND column_name = 'last_login_date'
      LIMIT 1
    `);

    expect(lastLoginDateTypeCheck.rows[0]?.data_type).toBe(
      'timestamp with time zone'
    );

    const countBeforeSecondRun = await pool.query<{ count: string }>(`
      SELECT COUNT(*)::text AS "count"
      FROM "bff_notification_consumer_details"
    `);

    await runMigrations();

    const countAfterSecondRun = await pool.query<{ count: string }>(`
      SELECT COUNT(*)::text AS "count"
      FROM "bff_notification_consumer_details"
    `);

    expect(countAfterSecondRun.rows[0]?.count).toBe(
      countBeforeSecondRun.rows[0]?.count
    );
  });
});
