import {
  BSN,
  CONSUMER_ID,
  NOTIFICATION_LEAN,
  SERVICE_ID,
} from './config-and-types';
import { logger } from '../../logging';
import { IS_DB_ENABLED } from '../db/config';
import { db } from '../db/db';

const TABLE_NAME = 'bff_notifications';
async function setupTables() {
  const { query } = await db();

  const createTableQuery = `
    -- Table Definition
    CREATE TABLE IF NOT EXISTS "public"."${TABLE_NAME}" (
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
    logger.info(`setupTable: ${TABLE_NAME} succeeded.`);
  } catch (error) {
    logger.error(error, `setupTable: ${TABLE_NAME} failed.`);
  }
}

if (IS_DB_ENABLED) {
  setupTables();
}

const queries = {
  upsertConsumer: `\
INSERT INTO ${TABLE_NAME} (profile_id, consumer_ids, service_ids, date_updated) \
VALUES ($1, ARRAY[$2], $3, now()) \
ON CONFLICT (profile_id) DO UPDATE \
SET \
  profile_id = EXCLUDED.profile_id, \
  consumer_ids = ( SELECT ARRAY( SELECT DISTINCT unnest(array_append(${TABLE_NAME}.consumer_ids, $2)) ) ), \
  service_ids = EXCLUDED.service_ids, \
  date_updated = EXCLUDED.date_updated; \
`,
  deleteProfileIfConsumerIdsIsEmpty: `DELETE FROM ${TABLE_NAME} WHERE consumer_ids = '{}' AND profile_id = $1`,
  deleteConsumer: `\
UPDATE ${TABLE_NAME}
SET consumer_ids = array_remove(consumer_ids, $1)
WHERE $1 = ANY (consumer_ids)
RETURNING profile_id, consumer_ids
    `,
  updateNotifications: `UPDATE ${TABLE_NAME} SET content = $2 WHERE profile_id = $1`,
  getProfiles: `SELECT * FROM ${TABLE_NAME}`,
  getProfileIds: `SELECT profile_id, consumer_ids, service_ids FROM ${TABLE_NAME}`,
  getProfileByConsumer: `SELECT profile_id FROM ${TABLE_NAME} WHERE $1 = ANY(consumer_ids)`,
  truncate: `TRUNCATE TABLE ${TABLE_NAME}`,
};

export async function truncate() {
  const { query } = await db();
  return query(queries.truncate);
}

export async function getProfileByConsumer(consumer_id: CONSUMER_ID) {
  const { queryGET } = await db();
  return queryGET(queries.getProfileByConsumer, [consumer_id]);
}

export async function upsertConsumer(
  profile_id: BSN,
  consumer_id: CONSUMER_ID,
  service_ids: SERVICE_ID[]
) {
  const { query } = await db();
  return query(queries.upsertConsumer, [profile_id, consumer_id, service_ids]);
}

// This should work in one query with a CTE, but it does not delete the row.
export async function deleteConsumer(consumer_id: CONSUMER_ID) {
  const { query, queryALL } = await db();
  const rows = (await queryALL(queries.deleteConsumer, [consumer_id])) as {
    profile_id: string;
    consumer_ids: string[];
  }[];
  for (const { profile_id, consumer_ids } of rows) {
    if (consumer_ids.length === 0) {
      await query(queries.deleteProfileIfConsumerIdsIsEmpty, [profile_id]);
    }
  }
  return rows.length;
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
