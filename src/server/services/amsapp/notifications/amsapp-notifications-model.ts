import type {
  BSN,
  ConsumerId,
  ServiceId,
} from './amsapp-notifications-types.ts';
import {
  type ConsumerProfile,
  type NotificationsService,
} from './amsapp-notifications-types.ts';
import { toISOString } from '../../../../universal/helpers/date.ts';
import { isRecord } from '../../../../universal/helpers/utils.ts';
import {
  decrypt,
  encryptDeterministic,
} from '../../../helpers/encrypt-decrypt.ts';
import { logger } from '../../../logging.ts';
import { IS_DB_ENABLED } from '../../db/config.ts';
import { db as db_, type DBAdapter } from '../../db/db.ts';
import { camelizeKeys } from '../../db/helper.ts';

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
export const NOTIFICATIONS_TABLE_NAME = 'bff_notifications';
async function setupTables() {
  const initDBQueries = [
    `
    -- Table Definition
    CREATE TABLE IF NOT EXISTS "public"."${NOTIFICATIONS_TABLE_NAME}" (
      "profile_id" varchar(43) NOT NULL,
      "consumer_ids" varchar(100)[] DEFAULT '{}',
      "service_ids" varchar(50)[] DEFAULT '{}',
      "content" JSONB,
      "date_updated" timestamp NOT NULL DEFAULT now(),
      "date_created" timestamp NOT NULL DEFAULT now(),
      PRIMARY KEY ("profile_id")
    );
  `,
    `
    ALTER TABLE IF EXISTS "public"."${NOTIFICATIONS_TABLE_NAME}"
    ADD IF NOT EXISTS "profile_name" VARCHAR(200);
  `,
    `
    ALTER TABLE IF EXISTS "public"."${NOTIFICATIONS_TABLE_NAME}"
    ALTER COLUMN "date_updated" TYPE timestamptz;
    ALTER TABLE IF EXISTS "public"."${NOTIFICATIONS_TABLE_NAME}"
    ALTER COLUMN "date_created" TYPE timestamptz;
  `,
    `
    ALTER TABLE IF EXISTS "public"."${NOTIFICATIONS_TABLE_NAME}"
    ADD IF NOT EXISTS "last_login_date" VARCHAR(200);
  `,
  ];

  try {
    for (const query of initDBQueries) {
      await db.query(query);
    }
    logger.info(`setupTable: ${NOTIFICATIONS_TABLE_NAME} succeeded.`);
  } catch (error) {
    logger.error(error, `setupTable: ${NOTIFICATIONS_TABLE_NAME} failed.`);
  }
}

if (IS_DB_ENABLED) {
  setupTables();
}

// POSTGRES is case insensitive. We therefore always use snake_case within postgres
const queries = {
  upsertConsumer: `\
INSERT INTO ${NOTIFICATIONS_TABLE_NAME} (profile_id, profile_name, consumer_ids, service_ids, date_updated, last_login_date)
VALUES ($1, $2, ARRAY[$3], $4, $5, $6)
ON CONFLICT (profile_id) DO UPDATE
SET
  profile_id = EXCLUDED.profile_id,
  profile_name = $2,
  consumer_ids = ( SELECT ARRAY( SELECT DISTINCT unnest(array_append(${NOTIFICATIONS_TABLE_NAME}.consumer_ids, $3)) ) ),
  service_ids = EXCLUDED.service_ids,
  date_updated = EXCLUDED.date_updated,
  last_login_date = EXCLUDED.last_login_date;
`,
  deleteProfileIfConsumerIdsIsEmpty: `DELETE FROM ${NOTIFICATIONS_TABLE_NAME} WHERE consumer_ids = '{}' AND profile_id = $1`,
  deleteConsumer: `\
UPDATE ${NOTIFICATIONS_TABLE_NAME}
SET consumer_ids = array_remove(consumer_ids, $1)
WHERE $1 = ANY (consumer_ids)
RETURNING profile_id, consumer_ids;
    `,
  updateNotifications: `\
UPDATE ${NOTIFICATIONS_TABLE_NAME} row
SET
  date_updated = $3,
  last_login_date = COALESCE($4, last_login_date),
  content = jsonb_set(
    coalesce(content, '{}'::jsonb),
    '{services}',
    coalesce(content->'services', '{}'::jsonb)
      ||
      ( -- Only allow services that are in the service_ids column to be updated
        SELECT coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
        FROM jsonb_each($2::jsonb)
        WHERE key = ANY (row.service_ids)
      )
  )
WHERE profile_id = $1;
`,
  getProfilesCount: `SELECT COUNT(*)::int AS row_count FROM ${NOTIFICATIONS_TABLE_NAME} `,
  getProfiles: `SELECT profile_id, consumer_ids, service_ids, content, date_updated, last_login_date FROM ${NOTIFICATIONS_TABLE_NAME}`,
  getProfileIds: `SELECT profile_id, consumer_ids, service_ids FROM ${NOTIFICATIONS_TABLE_NAME}`,
  getProfileByConsumer: `SELECT profile_name, service_ids, date_updated, last_login_date FROM ${NOTIFICATIONS_TABLE_NAME} WHERE $1 = ANY(consumer_ids)`,
  getProfileById: `SELECT profile_id, profile_name, service_ids, date_updated, last_login_date FROM ${NOTIFICATIONS_TABLE_NAME} WHERE profile_id = $1`,
  getRegistrationsOverview: `SELECT * FROM ${NOTIFICATIONS_TABLE_NAME}`,
  truncate: `TRUNCATE TABLE ${NOTIFICATIONS_TABLE_NAME}`,
};

export async function truncate() {
  return db.query(queries.truncate);
}

export async function getProfileById(profileId: BSN) {
  const [encryptedProfileID] = encryptDeterministic(profileId);
  return db.queryGET(queries.getProfileById, [encryptedProfileID]);
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
  const [encryptedProfileID] = encryptDeterministic(profileId);
  const now = toISOString(new Date());
  return db.query(queries.upsertConsumer, [
    encryptedProfileID,
    profileName,
    consumerId,
    serviceIds,
    now,
    now,
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
  services: NotificationsService[],
  lastLoginDate: string | null = null
) {
  const servicesObj = services.reduce(
    (acc, service) => ({ ...acc, [service.serviceId]: service }),
    {}
  );
  const [encryptedProfileID] = encryptDeterministic(profileId);
  return db.query(queries.updateNotifications, [
    encryptedProfileID,
    servicesObj,
    toISOString(new Date()),
    lastLoginDate,
  ]);
}

export async function getProfilesCount(options: {
  dateFrom?: string;
}): Promise<number> {
  const clauses = [];
  const values = [];
  if (options.dateFrom) {
    values.push(options.dateFrom);
    clauses.push(`WHERE date_updated >= $${values.length}`);
  }

  const queryWithClauses = `${queries.getProfilesCount} ${clauses.join(' ')}`;
  const row =
    ((await db.queryGET(queryWithClauses, values)) as {
      rowCount: number;
    }) || null;

  return row?.rowCount ?? 0;
}

export async function listProfiles(options: {
  dateFrom?: string;
  offset?: number;
  limit?: number;
}) {
  const clauses = [];
  const values = [];
  if (options.dateFrom) {
    values.push(options.dateFrom);
    clauses.push(`WHERE date_updated >= $${values.length}`);
  }
  clauses.push(`ORDER BY date_created ASC`);

  if (options.offset !== undefined) {
    values.push(options.offset);
    clauses.push(`OFFSET $${values.length}`);
  }
  if (options.limit !== undefined) {
    values.push(options.limit);
    clauses.push(`LIMIT $${values.length}`);
  }

  const queryWithClauses = `${queries.getProfiles} ${clauses.join(' ')}`;
  const rows = (await db.queryALL(
    queryWithClauses,
    values
  )) as ConsumerProfile[];

  return rows;
}

export async function listProfileIds() {
  const rows = (await db.queryALL(queries.getProfileIds)) as Pick<
    ConsumerProfile,
    'profileId' | 'serviceIds' | 'consumerIds' | 'lastLoginDate'
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
