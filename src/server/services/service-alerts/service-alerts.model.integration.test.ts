import { resolve } from "node:path";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import type { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { setupPgTestDb, truncatePgSchemaTables } from "../db/pg-test-utils.ts";
import { serviceAlertsTable } from "../db/schema/service-alerts.ts";

describe("service-alerts.model (postgres integration)", () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;
  let teardown: (() => Promise<void>) | undefined;

  const NOW = new Date("2026-11-10T12:00:00.000Z");
  const HOUR = 60 * 60 * 1000;
  const hoursFromNow = (hours: number) =>
    new Date(NOW.getTime() + hours * HOUR);

  async function insertAlert(title: string, dateStart: Date, dateEnd: Date) {
    await db.insert(serviceAlertsTable).values({
      title,
      body: "Er is een storing.",
      type: "warning",
      displayLocation: "notification",
      links: [],
      createdByEmail: "maker@example.com",
      updatedByEmail: "maker@example.com",
      dateStart,
      dateEnd,
    });
  }

  async function getActiveTitles() {
    const { getActiveServiceAlertRows } =
      await import("./service-alerts.model.ts");
    const rows = await getActiveServiceAlertRows(NOW);
    return rows.map(({ title }) => title);
  }

  beforeAll(async () => {
    const ctx = await setupPgTestDb({ databaseName: "mijnadam_test" });

    pool = ctx.pool;
    db = drizzle(pool);
    teardown = ctx.teardown;

    await migrate(db, {
      migrationsFolder: resolve(process.cwd(), "db-migrations"),
    });
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

  beforeEach(async () => {
    await truncatePgSchemaTables(pool);
  });

  it("returns an alert when now is between dateStart and dateEnd", async () => {
    await insertAlert("active", hoursFromNow(-1), hoursFromNow(1));

    expect(await getActiveTitles()).toEqual(["active"]);
  });

  it("does not return an alert that has not started yet", async () => {
    await insertAlert("upcoming", hoursFromNow(1), hoursFromNow(2));

    expect(await getActiveTitles()).toEqual([]);
  });

  it("does not return an alert that has already ended", async () => {
    await insertAlert("expired", hoursFromNow(-2), hoursFromNow(-1));

    expect(await getActiveTitles()).toEqual([]);
  });

  it("returns an alert that starts exactly now", async () => {
    await insertAlert("starts-now", NOW, hoursFromNow(1));

    expect(await getActiveTitles()).toEqual(["starts-now"]);
  });

  it("does not return an alert that ends exactly now", async () => {
    await insertAlert("ends-now", hoursFromNow(-1), NOW);

    expect(await getActiveTitles()).toEqual([]);
  });

  it("only returns the active alerts when active and inactive alerts exist", async () => {
    await insertAlert("expired", hoursFromNow(-2), hoursFromNow(-1));
    await insertAlert("active", hoursFromNow(-1), hoursFromNow(1));
    await insertAlert("upcoming", hoursFromNow(1), hoursFromNow(2));

    expect(await getActiveTitles()).toEqual(["active"]);
  });
});
