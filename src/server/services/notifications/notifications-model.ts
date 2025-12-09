import { BSN, CONSUMER_ID, SERVICE_ID, type SERVICE } from './config-and-types';
import { camelizeKeys } from './helper';
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

// POSTGRES is case insensitive. We therefore always use snake_case within postgres
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

export async function getProfileByConsumer(consumerId: CONSUMER_ID) {
  const { queryGET } = await db();
  return queryGET(queries.getProfileByConsumer, [consumerId]);
}

export async function upsertConsumer(
  profileId: BSN,
  consumerId: CONSUMER_ID,
  serviceIds: SERVICE_ID[]
) {
  const { query } = await db();
  return query(queries.upsertConsumer, [profileId, consumerId, serviceIds]);
}

// This should work in one query with a CTE, but it does not delete the row.
export async function deleteConsumer(consumerId: CONSUMER_ID) {
  const { query, queryALL } = await db();
  const rows = (await queryALL(queries.deleteConsumer, [consumerId])) as {
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

export async function storeNotifications(profileId: BSN, services: SERVICE[]) {
  const { query } = await db();
  return query(queries.updateNotifications, [profileId, { services }]);
}

export async function listProfiles() {
  const { queryALL } = await db();
  const rows = camelizeKeys(
    (await queryALL(queries.getProfiles)) as {
      profileId: BSN;
      consumer_ids: CONSUMER_ID[];
      service_ids: SERVICE_ID[];
      date_updated: string;
      content: { services: SERVICE[] } | null;
    }[]
  );
  return rows;
}

export async function listProfileIds() {
  const { queryALL } = await db();
  const rows = camelizeKeys(
    (await queryALL(queries.getProfileIds)) as {
      profile_id: BSN;
      consumer_ids: CONSUMER_ID[];
      service_ids: SERVICE_ID[];
    }[]
  );
  return rows;
}
