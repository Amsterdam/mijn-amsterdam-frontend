import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import { getPool } from '../db/postgres.ts';
import { serviceAlertsTable } from '../db/schema/service-alerts.ts';
import type { ServiceAlertInput } from './service-alerts.types.ts';

function getDrizzleDb() {
  return drizzle(getPool());
}

export async function getServiceAlerts() {
  const drizzleDb = getDrizzleDb();
  const rows = await drizzleDb.select().from(serviceAlertsTable);
  return rows;
}

export async function handleUpsertServiceAlert({
  id,
  title,
  body,
  type,
  displayLocation,
  links,
  environments,
  dateStart,
  dateEnd,
}: ServiceAlertInput) {
  const drizzleDb = getDrizzleDb();
  const alertData = {
    title,
    body,
    type,
    displayLocation,
    links,
    environments,
    dateStart: new Date(dateStart),
    dateEnd: dateEnd ? new Date(dateEnd) : null,
    dateUpdated: new Date(),
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
    await drizzleDb
      .insert(serviceAlertsTable)
      .values({ id: randomUUID(), ...alertData });
  }

  return { success: true };
}
