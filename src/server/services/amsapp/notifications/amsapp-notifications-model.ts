import { and, asc, eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import type {
  BSN,
  ConsumerId,
  ConsumerProfile,
  NotificationsService,
  ServiceId,
} from './amsapp-notifications-types.ts';
import { IS_PRODUCTION } from '../../../../universal/config/env.ts';
import { toISOString } from '../../../../universal/helpers/date.ts';
import { decrypt, encrypt } from '../../../helpers/encrypt-decrypt.ts';
import { hashWithPepper } from '../../../helpers/hash.ts';
import { IS_DB_ENABLED } from '../../db/config.ts';
import { getPool } from '../../db/postgres.ts';
import {
  NOTIFICATIONS_TABLE_NAME,
  notificationsTable,
} from '../../db/schema/amsapp-notifications.ts';

// POSTGRES is case insensitive. We therefore always use snake_case within postgres
export { NOTIFICATIONS_TABLE_NAME };

function getDrizzleDb() {
  return drizzle(getPool());
}

async function withDBEnabled<T>(
  onDbEnabled: (drizzleDb: ReturnType<typeof getDrizzleDb>) => Promise<T>,
  onDbDisabled: () => Promise<T>
): Promise<T> {
  if (!IS_DB_ENABLED) {
    return onDbDisabled();
  }

  return onDbEnabled(getDrizzleDb());
}

function getRowId(profileId: BSN): string {
  return hashWithPepper(profileId);
}

function encryptProfileId(profileId: BSN): string {
  const [encryptedProfileId] = encrypt(profileId);
  return encryptedProfileId;
}

export async function truncate() {
  return withDBEnabled(
    async (drizzleDb) => {
      await drizzleDb.delete(notificationsTable);
    },
    async () => undefined
  );
}

export async function getProfileById(profileId: BSN) {
  const id = getRowId(profileId);

  return withDBEnabled(
    async (drizzleDb) => {
      const rows = await drizzleDb
        .select({
          profileId: notificationsTable.profileId,
          profileName: notificationsTable.profileName,
          serviceIds: notificationsTable.serviceIds,
          dateUpdated: notificationsTable.dateUpdated,
          lastLoginDate: notificationsTable.lastLoginDate,
        })
        .from(notificationsTable)
        .where(eq(notificationsTable.id, id))
        .limit(1);

      return rows[0] ?? null;
    },
    async () => null
  );
}

export async function getProfileByConsumer(consumerId: ConsumerId) {
  return withDBEnabled(
    async (drizzleDb) => {
      const rows = await drizzleDb
        .select({
          profileName: notificationsTable.profileName,
          serviceIds: notificationsTable.serviceIds,
          dateUpdated: notificationsTable.dateUpdated,
          lastLoginDate: notificationsTable.lastLoginDate,
        })
        .from(notificationsTable)
        .where(sql`${consumerId} = ANY(${notificationsTable.consumerIds})`)
        .limit(1);

      return rows[0] ?? null;
    },
    async () => null
  );
}

export async function getRegistrationOverview() {
  /** Do not use outside non-prod admin routes until a proper access control is implemented and sensitive data is filtered out */
  if (IS_PRODUCTION) {
    return [];
  }

  return withDBEnabled(
    (drizzleDb) => drizzleDb.select().from(notificationsTable),
    async () => []
  );
}

export async function upsertConsumer(
  profileId: BSN,
  profileName: string,
  consumerId: ConsumerId,
  serviceIds: ServiceId[]
) {
  const id = getRowId(profileId);
  const encryptedProfileId = encryptProfileId(profileId);
  const now = toISOString(new Date());

  return withDBEnabled(
    async (drizzleDb) => {
      await drizzleDb
        .insert(notificationsTable)
        .values({
          id,
          profileId: encryptedProfileId,
          profileName,
          consumerIds: [consumerId],
          serviceIds,
          dateUpdated: new Date(now),
          lastLoginDate: now,
        })
        .onConflictDoUpdate({
          target: notificationsTable.id,
          set: {
            id: sql`excluded.id`,
            profileId: sql`excluded.profile_id`,
            profileName: sql`excluded.profile_name`,
            consumerIds: sql`(
              SELECT ARRAY(
                SELECT DISTINCT unnest(array_append(${notificationsTable.consumerIds}, ${consumerId}))
              )
            )`,
            serviceIds: sql`excluded.service_ids`,
            dateUpdated: sql`excluded.date_updated`,
            lastLoginDate: sql`excluded.last_login_date`,
          },
        });
    },
    async () => undefined
  );
}

// This should work in one query with a CTE, but it does not delete the row correctly.
// Therefore, multiple queries are used
export async function deleteConsumer(consumerId: ConsumerId) {
  return withDBEnabled(
    async (drizzleDb) => {
      const rows = await drizzleDb
        .update(notificationsTable)
        .set({
          consumerIds: sql`array_remove(${notificationsTable.consumerIds}, ${consumerId})`,
        })
        .where(sql`${consumerId} = ANY(${notificationsTable.consumerIds})`)
        .returning({
          id: notificationsTable.id,
          consumerIds: notificationsTable.consumerIds,
        });

      for (const { id, consumerIds } of rows) {
        if (!consumerIds || consumerIds.length === 0) {
          await drizzleDb
            .delete(notificationsTable)
            .where(
              and(
                eq(notificationsTable.id, id),
                sql`${notificationsTable.consumerIds} = '{}'::varchar[]`
              )
            );
        }
      }

      return rows.length;
    },
    async () => 0
  );
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
  const id = getRowId(profileId);
  const now = toISOString(new Date());

  return withDBEnabled(
    async (drizzleDb) => {
      await drizzleDb
        .update(notificationsTable)
        .set({
          dateUpdated: new Date(now),
          lastLoginDate: sql`COALESCE(${lastLoginDate}, ${notificationsTable.lastLoginDate})`,
          content: sql`jsonb_set(
            coalesce(${notificationsTable.content}, '{}'::jsonb),
            '{services}',
            coalesce(${notificationsTable.content}->'services', '{}'::jsonb)
              ||
              (
                SELECT coalesce(jsonb_object_agg(key, value), '{}'::jsonb)
                FROM jsonb_each(${JSON.stringify(servicesObj)}::jsonb)
                WHERE key = ANY (${notificationsTable.serviceIds})
              )
          )`,
        })
        .where(eq(notificationsTable.id, id));
    },
    async () => undefined
  );
}

export async function getProfilesCount(options: {
  dateFrom?: string;
}): Promise<number> {
  return withDBEnabled(
    async (drizzleDb) => {
      const rows = await drizzleDb
        .select({ rowCount: sql<number>`COUNT(*)::int` })
        .from(notificationsTable)
        .where(
          options.dateFrom
            ? sql`${notificationsTable.dateUpdated} >= ${options.dateFrom}`
            : sql`TRUE`
        );

      return rows[0]?.rowCount ?? 0;
    },
    async () => 0
  );
}

export async function listProfiles(options: {
  dateFrom?: string;
  offset?: number;
  limit?: number;
}) {
  return withDBEnabled(
    async (drizzleDb) => {
      const baseQuery = drizzleDb
        .select({
          profileId: notificationsTable.profileId,
          consumerIds: notificationsTable.consumerIds,
          serviceIds: notificationsTable.serviceIds,
          content: notificationsTable.content,
          dateUpdated: notificationsTable.dateUpdated,
          lastLoginDate: notificationsTable.lastLoginDate,
        })
        .from(notificationsTable)
        .where(
          options.dateFrom
            ? sql`${notificationsTable.dateUpdated} >= ${options.dateFrom}`
            : sql`TRUE`
        )
        .orderBy(asc(notificationsTable.dateCreated));

      const query =
        options.offset !== undefined && options.limit !== undefined
          ? baseQuery.offset(options.offset).limit(options.limit)
          : options.offset !== undefined
            ? baseQuery.offset(options.offset)
            : options.limit !== undefined
              ? baseQuery.limit(options.limit)
              : baseQuery;

      const rows = await query;

      return rows as unknown as ConsumerProfile[];
    },
    async () => []
  );
}

export async function listProfileIds() {
  return withDBEnabled(
    async (drizzleDb) => {
      const rows = await drizzleDb
        .select({
          profileId: notificationsTable.profileId,
          consumerIds: notificationsTable.consumerIds,
          serviceIds: notificationsTable.serviceIds,
        })
        .from(notificationsTable);

      return rows.map((row) => {
        const decryptedProfileID = decrypt(row.profileId);
        return {
          profileId: decryptedProfileID,
          serviceIds: row.serviceIds,
          consumerIds: row.consumerIds,
        };
      });
    },
    async () => []
  );
}
