import {
  BSN,
  CONSUMER_ID,
  NOTIFICATION_LEAN,
  SERVICE_ID,
} from './config-and-types';
import { logger } from '../../logging';
import { IS_DB_ENABLED } from '../db/config';
import { db } from '../db/db';

const TABLE_NOTIFICATIONS = 'bff_notifications';
async function setupTables() {
  const { query } = await db();

  const createTableQuery = `
    -- Table Definition
    CREATE TABLE IF NOT EXISTS "public"."${TABLE_NOTIFICATIONS}" (
      "profile_id" varchar(100) NOT NULL,
      "consumer_ids" varchar(100)[] DEFAULT '{}',
      "service_ids" varchar(50)[] DEFAULT '{}',
      "content" JSONB,
      "date_updated" timestamp NOT NULL DEFAULT now(),
      "date_created" timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY ("profile_id")
    );
  `;

  try {
    await query(createTableQuery);
    logger.info(`setupTable: ${TABLE_NOTIFICATIONS} succeeded.`);
  } catch (error) {
    logger.error(error, `setupTable: ${TABLE_NOTIFICATIONS} failed.`);
  }
}

if (IS_DB_ENABLED) {
  setupTables();
}

const queries = ((tableName: string = TABLE_NOTIFICATIONS) => ({
  upsertConsumer: `\
INSERT INTO ${tableName} (profile_id, consumer_ids, service_ids, date_updated) \
VALUES ($1, ARRAY[$2], $3, now()) \
ON CONFLICT (profile_id) DO UPDATE \
SET \
  profile_id = EXCLUDED.profile_id, \
  consumer_ids = ( SELECT ARRAY( SELECT DISTINCT unnest(array_append(${tableName}.consumer_ids, $2)) ) ), \
  service_ids = EXCLUDED.service_ids, \
  date_updated = EXCLUDED.date_updated;`,
  updateNotifications: `UPDATE ${tableName} SET content = $2 WHERE profile_id = $1`,
  getProfiles: `SELECT * FROM ${tableName}`,
  getProfileIds: `SELECT profile_id, consumer_ids, service_ids FROM ${tableName}`,
}))();

export async function upsertConsumer(
  profile_id: BSN,
  consumer_id: CONSUMER_ID,
  service_ids: SERVICE_ID[]
) {
  const { query } = await db();
  return query(queries.upsertConsumer, [profile_id, consumer_id, service_ids]);
}

export async function storeNotifications(
  profile_id: BSN,
  notifications: NOTIFICATION_LEAN[]
) {
  const { query } = await db();
  return query(queries.updateNotifications, [profile_id, { notifications }]);
}

export async function listProfiles() {
  const { queryALL } = await db();
  const rows = (await queryALL(queries.getProfiles)) as {
    profile_id: BSN;
    consumer_ids: CONSUMER_ID[];
    service_ids: SERVICE_ID[];
    date_updated: string;
    content: { notifications: NOTIFICATION_LEAN[] } | null;
  }[];
  return rows;
}

export async function listProfileIds() {
  const { queryALL } = await db();
  const rows = (await queryALL(queries.getProfileIds)) as {
    profile_id: BSN;
    consumer_ids: CONSUMER_ID[];
    service_ids: SERVICE_ID[];
  }[];
  return rows;
}
