import {
  BSN,
  ConsumerId,
  ServiceId,
  type ConsumerNotifications,
  type NotificationsService,
} from './amsapp-notifications-types';
import { isRecord } from '../../../../universal/helpers/utils';
import { decrypt, encrypt } from '../../../helpers/encrypt-decrypt';
import { logger } from '../../../logging';
import { IS_DB_ENABLED } from '../../db/config';
import { db as db_, type DBAdapter } from '../../db/db';
import { camelizeKeys } from '../../db/helper';

// POSTGRES is case insensitive. We therefore always use snake_case within postgres
// and transform the returned column names to camelCase.
const db = {
  // Because the output of query is less predictable.
  // Only queries that don't expect a return value are allowed
  query: async function query(
    ...args: Parameters<DBAdapter['query']>
  ): Promise<void> {
    const { query } = await db_();
    await query(...args);
  },
  queryGET: async function queryGET(
    ...args: Parameters<DBAdapter['queryGET']>
  ) {
    const { queryGET } = await db_();
    const row = await queryGET(...args);
    if (isRecord(row)) {
      return camelizeKeys(row);
    }
    return row;
  },
  queryALL: async function queryALL(
    ...args: Parameters<DBAdapter['queryALL']>
  ) {
    const { queryALL } = await db_();
    const rows = await queryALL(...args);
    return rows.map((row) => (isRecord(row) ? camelizeKeys(row) : row));
  },
};

// POSTGRES is case insensitive. We therefore always use snake_case within postgres
const TABLE_NAME = 'bff_notifications';
async function setupTables() {
  const createTableQuery = `
    -- Table Definition
    CREATE TABLE IF NOT EXISTS "public"."${TABLE_NAME}" (
      "profile_id" varchar(43) NOT NULL,
      "consumer_ids" varchar(100)[] DEFAULT '{}',
      "service_ids" varchar(50)[] DEFAULT '{}',
      "content" JSONB,
      "date_updated" timestamp NOT NULL DEFAULT now(),
      "date_created" timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY ("profile_id")
    );
  `;

  const alterTableQuery1 = `
        ALTER TABLE IF EXISTS "public"."${TABLE_NAME}"
        ADD IF NOT EXISTS "profile_name" VARCHAR(200);
      `;

  try {
    await db.query(createTableQuery);
    await db.query(alterTableQuery1);
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
INSERT INTO ${TABLE_NAME} (profile_id, profile_name, consumer_ids, service_ids, date_updated) \
VALUES ($1, $2, ARRAY[$3], $4, now()) \
ON CONFLICT (profile_id) DO UPDATE \
SET \
  profile_id = EXCLUDED.profile_id, \
  profile_name = EXCLUDED.profile_name, \
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
  getProfileIds: `SELECT profile_id, profile_name, consumer_ids, service_ids FROM ${TABLE_NAME}`,
  getProfileByConsumer: `SELECT profile_id FROM ${TABLE_NAME} WHERE $1 = ANY(consumer_ids)`,
  getRegistrationsOverview: `SELECT * FROM ${TABLE_NAME}`,
  truncate: `TRUNCATE TABLE ${TABLE_NAME}`,
};

export async function truncate() {
  return db.query(queries.truncate);
}

export async function getProfileByConsumer(consumerId: ConsumerId) {
  return db.queryGET(queries.getProfileByConsumer, [consumerId]);
}

export async function getRegistrationOverview() {
  return db.queryALL(queries.getRegistrationsOverview);
}

export async function upsertConsumer(
  profileId: BSN,
  profileName: string,
  consumerId: ConsumerId,
  serviceIds: ServiceId[]
) {
  const [encryptedProfileID] = encrypt(profileId);
  return db.query(queries.upsertConsumer, [
    encryptedProfileID,
    profileName,
    consumerId,
    serviceIds,
  ]);
}

// This should work in one query with a CTE, but it does not delete the row correctly.
// Therefore, multiple queries are used
export async function deleteConsumer(consumerId: ConsumerId) {
  const rows = (await db.queryALL(queries.deleteConsumer, [consumerId])) as {
    profileId: string;
    consumerIds: string[];
  }[];
  for (const { profileId, consumerIds } of rows) {
    if (!consumerIds || consumerIds.length === 0) {
      await db.query(queries.deleteProfileIfConsumerIdsIsEmpty, [profileId]);
    }
  }
  return rows.length;
}

export async function storeNotifications(
  profileId: BSN,
  services: NotificationsService[]
) {
  const [encryptedProfileID] = encrypt(profileId);
  return db.query(queries.updateNotifications, [
    encryptedProfileID,
    { services },
  ]);
}

export async function listProfiles() {
  const rows = (await db.queryALL(
    queries.getProfiles
  )) as ConsumerNotifications[];

  return rows;
}

export async function listProfileIds() {
  const rows = (await db.queryALL(queries.getProfileIds)) as Pick<
    ConsumerNotifications,
    'profileId' | 'serviceIds' | 'consumerIds'
  >[];

  return rows.map((row) => {
    const decryptedProfileID = decrypt(row.profileId);
    return {
      profileId: decryptedProfileID,
      serviceIds: row.serviceIds,
      consumerIds: row.consumerIds,
    };
  });
}
