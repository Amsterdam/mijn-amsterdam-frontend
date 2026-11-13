import { randomUUID } from 'node:crypto';

import { and, eq, gt, lte } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { IS_DB_ENABLED } from '../db/config.ts';
import { getPool } from '../db/postgres.ts';
import { serviceAlertsTable } from '../db/schema/service-alerts.ts';
import type { ServiceAlertInput } from './service-alerts.types.ts';

function getDrizzleDb() {
  return drizzle(getPool());
}

export type ServiceAlertRow = typeof serviceAlertsTable.$inferSelect;

export async function getServiceAlerts(): Promise<ServiceAlertRow[]> {
  const drizzleDb = getDrizzleDb();
  return drizzleDb.select().from(serviceAlertsTable);
}

export async function getActiveServiceAlertRows(
  now: Date = new Date()
): Promise<ServiceAlertRow[]> {
  if (!IS_DB_ENABLED) {
    return [];
  }

  const drizzleDb = getDrizzleDb();
  return drizzleDb
    .select()
    .from(serviceAlertsTable)
    .where(
      and(
        lte(serviceAlertsTable.dateStart, now),
        gt(serviceAlertsTable.dateEnd, now)
      )
    );
}

export async function upsertServiceAlert(
  {
    id,
    title,
    body,
    type,
    displayLocation,
    themaId,
    links,
    dateStart,
    dateEnd,
  }: ServiceAlertInput,
  updatedByEmail: string
) {
  const drizzleDb = getDrizzleDb();
  const alertData = {
    title,
    body,
    type,
    displayLocation,
    themaId: themaId ?? null,
    links,
    dateStart: new Date(dateStart),
    dateEnd: new Date(dateEnd),
    dateUpdated: new Date(),
    updatedByEmail,
  };

  if (id) {
    const [updatedAlert] = await drizzleDb
      .update(serviceAlertsTable)
      .set(alertData)
      .where(eq(serviceAlertsTable.id, id))
      .returning({ id: serviceAlertsTable.id });

    if (!updatedAlert) {
      throw new Error(`Service alert with id "${id}" was not found`);
    }
  } else {
    await drizzleDb.insert(serviceAlertsTable).values({
      id: randomUUID(),
      ...alertData,
      createdByEmail: updatedByEmail,
    });
  }

  return { success: true };
}
