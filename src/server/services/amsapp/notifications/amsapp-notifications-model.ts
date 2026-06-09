import { addMonths } from 'date-fns';
import { and, asc, eq, inArray, lte, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';

import type {
  BSN,
  ConsumerDetail,
  ConsumerId,
  ConsumerProfile,
  NotificationsService,
  ServiceId,
} from './amsapp-notifications-types.ts';
import { IS_PRODUCTION } from '../../../../universal/config/env.ts';
import { decrypt, encrypt } from '../../../helpers/encrypt-decrypt.ts';
import { hashWithPepper } from '../../../helpers/hash.ts';
import { IS_DB_ENABLED } from '../../db/config.ts';
import { getPool } from '../../db/postgres.ts';
import {
  NOTIFICATIONS_TABLE_NAME,
  notificationsConsumerDetailsTable,
  notificationsTable,
} from '../../db/schema/amsapp-notifications.ts';

export { NOTIFICATIONS_TABLE_NAME };

const LOGIN_EXPIRY_MONTHS = 3;

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

function getLoginExpiryDate(now: Date) {
  return addMonths(now, LOGIN_EXPIRY_MONTHS);
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
          loginExpiryDate: notificationsConsumerDetailsTable.loginExpiryDate,
        })
        .from(notificationsConsumerDetailsTable)
        .innerJoin(
          notificationsTable,
          eq(
            notificationsTable.id,
            notificationsConsumerDetailsTable.notificationRowId
          )
        )
        .where(eq(notificationsConsumerDetailsTable.consumerId, consumerId))
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
  const nowDate = new Date();
  const loginExpiryDate = getLoginExpiryDate(nowDate);

  return withDBEnabled(
    async (drizzleDb) => {
      await drizzleDb
        .insert(notificationsTable)
        .values({
          id,
          profileId: encryptedProfileId,
          profileName,
          consumerIds: [consumerId], // TODO MIJN-13137: Remove temporary consumerIds column after rollout window and update onConflictDoUpdate accordingly.
          serviceIds,
          dateUpdated: nowDate,
          lastLoginDate: nowDate,
        })
        .onConflictDoUpdate({
          target: notificationsTable.id,
          set: {
            id: sql`excluded.id`,
            profileId: sql`excluded.profile_id`,
            profileName: sql`excluded.profile_name`,
            consumerIds: sql`(
              SELECT ARRAY(
                SELECT DISTINCT unnest(
                  array_append(
                    coalesce(${notificationsTable.consumerIds}, '{}'::varchar[]),
                    ${consumerId}
                  )
                )
              )
            )`,
            serviceIds: sql`excluded.service_ids`,
            dateUpdated: sql`excluded.date_updated`,
            lastLoginDate: sql`excluded.last_login_date`,
          },
        });

      await drizzleDb
        .insert(notificationsConsumerDetailsTable)
        .values({
          consumerId,
          notificationRowId: id,
          loginExpiryDate,
        })
        .onConflictDoUpdate({
          target: notificationsConsumerDetailsTable.consumerId,
          set: {
            notificationRowId: id,
            loginExpiryDate,
          },
        });

      // TODO MIJN-13137: Keep legacy consumer_ids in sync when a consumer moves between profiles. Can be removed after consumerIds column is removed.
      await drizzleDb
        .update(notificationsTable)
        .set({
          consumerIds: sql`array_remove(${notificationsTable.consumerIds}, ${consumerId})`,
        })
        .where(
          and(
            sql`${notificationsTable.id} <> ${id}`,
            sql`${consumerId} = ANY(${notificationsTable.consumerIds})`
          )
        );
    },
    async () => undefined
  );
}

export async function deleteOrphanProfiles(
  notificationRowIds?: string[],
  now: Date = new Date()
) {
  return withDBEnabled(
    async (drizzleDb) => {
      // When row ids are explicitly provided, only those profiles are candidates.
      if (notificationRowIds?.length === 0) {
        return;
      }

      const uniqueNotificationRowIds = [...new Set(notificationRowIds ?? [])];

      const orphanCondition = sql`NOT EXISTS (
        SELECT 1
        FROM ${notificationsConsumerDetailsTable}
        WHERE ${notificationsConsumerDetailsTable.notificationRowId} = ${notificationsTable.id}
          AND ${notificationsConsumerDetailsTable.loginExpiryDate} > ${now}
      )`;

      if (uniqueNotificationRowIds.length > 0) {
        await drizzleDb
          .delete(notificationsTable)
          .where(
            and(
              inArray(notificationsTable.id, uniqueNotificationRowIds),
              orphanCondition
            )
          );
        return;
      }

      await drizzleDb.delete(notificationsTable).where(orphanCondition);
    },
    async () => undefined
  );
}

export async function deleteConsumers(
  consumerIds: ConsumerId[]
): Promise<ConsumerId[]> {
  const uniqueConsumerIds = [...new Set(consumerIds)];

  return withDBEnabled(
    async (drizzleDb) => {
      const deletedConsumerDetails = await drizzleDb
        .delete(notificationsConsumerDetailsTable)
        .where(
          inArray(
            notificationsConsumerDetailsTable.consumerId,
            uniqueConsumerIds
          )
        )
        .returning({
          consumerId: notificationsConsumerDetailsTable.consumerId,
          notificationRowId:
            notificationsConsumerDetailsTable.notificationRowId,
        });

      const notificationRowIds = [
        ...new Set(
          deletedConsumerDetails.map((detail) => detail.notificationRowId)
        ),
      ];

      // TODO MIJN-13137: Remove temporary consumerIds column after rollout window and remove the following block that keeps the legacy consumerIds in sync.
      const deletedConsumerIds = [
        ...new Set(deletedConsumerDetails.map((detail) => detail.consumerId)),
      ];
      for (const deletedConsumerId of deletedConsumerIds) {
        await drizzleDb
          .update(notificationsTable)
          .set({
            consumerIds: sql`array_remove(${notificationsTable.consumerIds}, ${deletedConsumerId})`,
          })
          .where(
            sql`${deletedConsumerId} = ANY(${notificationsTable.consumerIds})`
          );
      }

      await deleteOrphanProfiles(notificationRowIds);

      return deletedConsumerDetails.map((detail) => detail.consumerId);
    },
    async () => []
  );
}

export async function listConsumerIds(
  loginExpiryDateUpperBound: Date
): Promise<ConsumerId[]> {
  return withDBEnabled(
    async (drizzleDb) => {
      const rows = await drizzleDb
        .select({
          consumerId: notificationsConsumerDetailsTable.consumerId,
        })
        .from(notificationsConsumerDetailsTable)
        .where(
          lte(
            notificationsConsumerDetailsTable.loginExpiryDate,
            loginExpiryDateUpperBound
          )
        );

      return rows.map((row) => row.consumerId);
    },
    async () => []
  );
}

export async function storeNotifications(
  profileId: BSN,
  services: NotificationsService[],
  lastLoginDate: Date | null = null
) {
  const servicesObj = services.reduce(
    (acc, service) => ({ ...acc, [service.serviceId]: service }),
    {}
  );
  const id = getRowId(profileId);

  return withDBEnabled(
    async (drizzleDb) => {
      await drizzleDb
        .update(notificationsTable)
        .set({
          dateUpdated: new Date(),
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
      const hasLinkedConsumerCondition = sql`EXISTS (
        SELECT 1
        FROM ${notificationsConsumerDetailsTable}
        WHERE ${notificationsConsumerDetailsTable.notificationRowId} = ${notificationsTable.id}
      )`;

      const rows = await drizzleDb
        .select({ rowCount: sql<number>`COUNT(*)::int` })
        .from(notificationsTable)
        .where(
          and(
            options.dateFrom
              ? sql`${notificationsTable.dateUpdated} >= ${options.dateFrom}`
              : sql`TRUE`,
            hasLinkedConsumerCondition
          )
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
}): Promise<ConsumerProfile[]> {
  return withDBEnabled(
    async (drizzleDb) => {
      let query = drizzleDb
        .select({
          profileId: notificationsTable.profileId,
          serviceIds: notificationsTable.serviceIds,
          content: notificationsTable.content,
          dateUpdated: notificationsTable.dateUpdated,
          lastLoginDate: notificationsTable.lastLoginDate,
          consumerDetails: sql<
            {
              id: string;
              loginExpiryDate: string;
            }[]
          >`COALESCE(
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', ${notificationsConsumerDetailsTable.consumerId},
                'loginExpiryDate', ${notificationsConsumerDetailsTable.loginExpiryDate}
              )
              ORDER BY ${notificationsConsumerDetailsTable.loginExpiryDate} ASC
            ) FILTER (WHERE ${notificationsConsumerDetailsTable.consumerId} IS NOT NULL),
            '[]'::json
          )`,
        })
        .from(notificationsTable)
        .innerJoin(
          notificationsConsumerDetailsTable,
          eq(
            notificationsConsumerDetailsTable.notificationRowId,
            notificationsTable.id
          )
        )
        .where(
          options.dateFrom
            ? sql`${notificationsTable.dateUpdated} >= ${options.dateFrom}`
            : sql`TRUE`
        )
        .groupBy(notificationsTable.id)
        .orderBy(asc(notificationsTable.dateCreated))
        .$dynamic();

      if (options.offset !== undefined) {
        query = query.offset(options.offset);
      }
      if (options.limit !== undefined) {
        query = query.limit(options.limit);
      }

      const rows = await query;

      return rows.map((row) => {
        // The JSON_AGG casts all values in consumerDetails to a string. To comply with our ConsumerDetail type, we need to transform the loginExpiryDate back to a Date or null.
        const consumerDetails: ConsumerDetail[] = row.consumerDetails.map(
          (consumerDetail) => ({
            id: consumerDetail.id,
            loginExpiryDate: new Date(consumerDetail.loginExpiryDate),
          })
        );

        return {
          profileId: row.profileId,
          consumerIds: consumerDetails.map(
            (consumerDetail) => consumerDetail.id
          ),
          consumerDetails,
          serviceIds: row.serviceIds,
          content: row.content,
          dateUpdated: row.dateUpdated,
          lastLoginDate: row.lastLoginDate,
        };
      });
    },
    async () => []
  );
}

export async function listProfileIds() {
  return withDBEnabled(
    async (drizzleDb) => {
      const rows = await drizzleDb
        .select({
          id: notificationsTable.id,
          profileId: notificationsTable.profileId,
          serviceIds: notificationsTable.serviceIds,
        })
        .from(notificationsTable);

      const notificationRowIds = rows.map((row) => row.id);
      const consumerRows = notificationRowIds.length
        ? await drizzleDb
            .select({
              notificationRowId:
                notificationsConsumerDetailsTable.notificationRowId,
              consumerId: notificationsConsumerDetailsTable.consumerId,
            })
            .from(notificationsConsumerDetailsTable)
            .where(
              inArray(
                notificationsConsumerDetailsTable.notificationRowId,
                notificationRowIds
              )
            )
        : [];

      const consumersByNotificationRowId = consumerRows.reduce(
        (acc, consumerRow) => {
          const currentConsumers = acc.get(consumerRow.notificationRowId) ?? [];
          currentConsumers.push(consumerRow.consumerId);
          acc.set(consumerRow.notificationRowId, currentConsumers);
          return acc;
        },
        new Map<string, ConsumerId[]>()
      );

      return rows.map((row) => {
        const decryptedProfileID = decrypt(row.profileId);
        return {
          profileId: decryptedProfileID,
          serviceIds: row.serviceIds,
          consumerIds: consumersByNotificationRowId.get(row.id) ?? [],
        };
      });
    },
    async () => []
  );
}
