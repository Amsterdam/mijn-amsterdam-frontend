import { resolve } from 'node:path';

import { addDays, addHours, addMonths } from 'date-fns';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import type { Pool } from 'pg';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  BSN,
  NotificationsService,
} from './amsapp-notifications-types.ts';
import {
  setupPgTestDb,
  truncatePgSchemaTables,
} from '../../db/pg-test-utils.ts';
import {
  notificationsConsumerDetailsTable,
  notificationsTable,
} from '../../db/schema/amsapp-notifications.ts';

describe('amsapp-notifications-model (postgres integration)', () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;
  let teardown: (() => Promise<void>) | undefined;

  const databaseName = 'mijnadam_test';

  const profileId: BSN = '999999999' as BSN;

  const DEFAULT_TIME = new Date('2020-01-01T00:00:00.000Z');
  const defaultTimePlusHour = addHours(DEFAULT_TIME, 1);

  const SERVICE_A: NotificationsService = {
    serviceId: 'afis',
    dateUpdated: DEFAULT_TIME.toISOString(),
    status: 'OK',
    content: [],
  };
  const SERVICE_B: NotificationsService = {
    serviceId: 'avg',
    dateUpdated: defaultTimePlusHour.toISOString(),
    status: 'OK',
    content: [],
  };

  beforeAll(async () => {
    const ctx = await setupPgTestDb({
      databaseName,
      envOverrides: { BFF_DB_ENABLED: 'true' },
    });

    pool = ctx.pool;
    db = drizzle(pool);
    teardown = ctx.teardown;

    await migrate(db, {
      migrationsFolder: resolve(process.cwd(), 'drizzle'),
    });

    await import('./amsapp-notifications-model.ts');

    // Testcontainers and migration startup need real timers.
    vi.useFakeTimers();
  }, 120_000);

  afterAll(async () => {
    vi.useRealTimers();
    try {
      if (pool) {
        await truncatePgSchemaTables(pool);
      }
    } finally {
      await teardown?.();
    }
  }, 60_000);

  beforeEach(async () => {
    if (pool) {
      await truncatePgSchemaTables(pool);
    }
    vi.setSystemTime(DEFAULT_TIME);
  });

  describe('upsertConsumer', () => {
    it('projects consumers from consumer details and overwrites service_ids', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      const rows1 = await model.listProfileIds();
      expect(rows1).toHaveLength(1);
      expect(rows1[0]).toMatchObject({
        profileId: '999999999',
        consumerIds: expect.arrayContaining(['consumer-1']),
        serviceIds: [SERVICE_A.serviceId],
      });

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-2', [
        SERVICE_B.serviceId,
      ]);

      const rows2 = await model.listProfileIds();
      expect(rows2).toHaveLength(1);
      expect(rows2[0]).toMatchObject({
        profileId: '999999999',
        consumerIds: expect.arrayContaining(['consumer-1', 'consumer-2']),
        serviceIds: [SERVICE_B.serviceId],
      });
    });

    it('keeps old and new profiles until reconciliation runs', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer('1', 'Test Person 1', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);
      await model.upsertConsumer('2', 'Test Person 2', 'consumer-1', [
        SERVICE_B.serviceId,
      ]);

      const profiles = await model.listProfileIds();
      expect(profiles).toHaveLength(2);
      expect(profiles).toContainEqual(
        expect.objectContaining({
          profileId: '1',
          consumerIds: [],
          serviceIds: [SERVICE_A.serviceId],
        })
      );
      expect(profiles).toContainEqual(
        expect.objectContaining({
          profileId: '2',
          consumerIds: ['consumer-1'],
          serviceIds: [SERVICE_B.serviceId],
        })
      );
    });

    it('resets consumer loginExpiryDate to three calendar months on each registration', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      const firstRegistrationDate = addHours(addDays(DEFAULT_TIME, 30), 10);
      const secondRegistrationDate = addHours(addDays(DEFAULT_TIME, 59), 10);

      vi.setSystemTime(firstRegistrationDate);
      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      const firstRows = await db
        .select({
          loginExpiryDate: notificationsConsumerDetailsTable.loginExpiryDate,
        })
        .from(notificationsConsumerDetailsTable)
        .where(eq(notificationsConsumerDetailsTable.consumerId, 'consumer-1'))
        .limit(1);

      const firstLoginExpiryDate = firstRows[0]?.loginExpiryDate;
      expect(firstLoginExpiryDate).toStrictEqual(
        addMonths(firstRegistrationDate, 3)
      );

      vi.setSystemTime(secondRegistrationDate);
      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_B.serviceId,
      ]);

      const secondRows = await db
        .select({
          loginExpiryDate: notificationsConsumerDetailsTable.loginExpiryDate,
        })
        .from(notificationsConsumerDetailsTable)
        .where(eq(notificationsConsumerDetailsTable.consumerId, 'consumer-1'))
        .limit(1);

      const secondLoginExpiryDate = secondRows[0]?.loginExpiryDate;
      expect(secondLoginExpiryDate).toStrictEqual(
        addMonths(secondRegistrationDate, 3)
      );
    });
  });

  describe('deleteOrphanProfiles', () => {
    it('moves an already-registered consumer to another profile and deletes orphaned profile rows', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer('1', 'Test Person 1', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);
      await model.upsertConsumer('2', 'Test Person 2', 'consumer-1', [
        SERVICE_B.serviceId,
      ]);

      await model.deleteOrphanProfiles();

      const profiles = await model.listProfileIds();
      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toMatchObject({
        profileId: '2',
        consumerIds: ['consumer-1'],
        serviceIds: [SERVICE_B.serviceId],
      });
    });
  });

  describe('getProfilesCount', () => {
    it('returns the total number of visible profiles with active consumers', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer('1', 'Test Person 1', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);
      await model.upsertConsumer('2', 'Test Person 2', 'consumer-2', [
        SERVICE_A.serviceId,
      ]);

      const totalItems = await model.getProfilesCount({});
      expect(totalItems).toBe(2);
    });

    it('returns the total visible profile count where dateUpdated is after dateFrom', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      vi.setSystemTime(DEFAULT_TIME);
      await model.upsertConsumer('1', 'Test Person 1', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      vi.setSystemTime(defaultTimePlusHour);
      await model.upsertConsumer('2', 'Test Person 2', 'consumer-2', [
        SERVICE_A.serviceId,
      ]);

      vi.setSystemTime(addHours(DEFAULT_TIME, 2));
      const totalItems = await model.getProfilesCount({
        dateFrom: addHours(DEFAULT_TIME, 1).toISOString(),
      });
      expect(totalItems).toBe(1);
    });
  });
  describe('listConsumerIdsWithLoginExpiryDateBefore', () => {
    it('returns consumers with loginExpiryDate on or before the provided upper bound', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer('1', 'Test Person 1', 'consumer-expired', [
        SERVICE_A.serviceId,
      ]);
      await model.upsertConsumer('2', 'Test Person 2', 'consumer-at-bound', [
        SERVICE_A.serviceId,
      ]);
      await model.upsertConsumer('3', 'Test Person 3', 'consumer-active', [
        SERVICE_A.serviceId,
      ]);

      await db
        .update(notificationsConsumerDetailsTable)
        .set({ loginExpiryDate: addDays(DEFAULT_TIME, -1) })
        .where(
          eq(notificationsConsumerDetailsTable.consumerId, 'consumer-expired')
        );

      await db
        .update(notificationsConsumerDetailsTable)
        .set({ loginExpiryDate: DEFAULT_TIME })
        .where(
          eq(notificationsConsumerDetailsTable.consumerId, 'consumer-at-bound')
        );

      await db
        .update(notificationsConsumerDetailsTable)
        .set({ loginExpiryDate: addDays(DEFAULT_TIME, 1) })
        .where(
          eq(notificationsConsumerDetailsTable.consumerId, 'consumer-active')
        );

      const consumerIds =
        await model.listConsumerIdsWithLoginExpiryDateBefore(DEFAULT_TIME);

      expect(consumerIds.sort()).toStrictEqual([
        'consumer-at-bound',
        'consumer-expired',
      ]);
    });
  });

  describe('deleteConsumers', () => {
    it('removes the consumer when there is more than one consumer', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);
      await model.upsertConsumer(profileId, 'Test Person', 'consumer-2', [
        SERVICE_A.serviceId,
      ]);
      const profilesWith2Consumers = await model.listProfileIds();
      expect(profilesWith2Consumers).toHaveLength(1);
      expect(profilesWith2Consumers[0].consumerIds).toHaveLength(2);

      await model.deleteConsumers(['consumer-2']);
      const profilesWithOneConsumer = await model.listProfileIds();
      expect(profilesWithOneConsumer).toHaveLength(1);
      expect(profilesWithOneConsumer[0].consumerIds).toHaveLength(1);
    });

    it('removes the row when the last consumer detail is deleted', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      const deletedConsumerIds = await model.deleteConsumers(['consumer-1']);
      expect(deletedConsumerIds).toStrictEqual(['consumer-1']);
      const profilesEmpty = await model.listProfileIds();
      expect(profilesEmpty).toHaveLength(0);
    });

    it('deletes multiple consumers in a single call', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);
      await model.upsertConsumer(profileId, 'Test Person', 'consumer-2', [
        SERVICE_A.serviceId,
      ]);

      const deletedConsumerIds = await model.deleteConsumers([
        'consumer-1',
        'consumer-2',
      ]);

      expect(deletedConsumerIds.sort()).toStrictEqual([
        'consumer-1',
        'consumer-2',
      ]);
      const profiles = await model.listProfileIds();
      expect(profiles).toHaveLength(0);
    });

    it('deletes orphaned profile when the last consumer detail is removed', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer('1', 'Test Person 1', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      await model.deleteConsumers(['consumer-1']);

      const profileRows = await db
        .select({ id: notificationsTable.id })
        .from(notificationsTable)
        .limit(1);

      expect(profileRows).toHaveLength(0);
    });
  });

  describe('getProfileByConsumer', () => {
    it('returns loginExpiryDate alongside profile data for registered consumers', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      const loginDate = new Date('2020-03-01T12:00:00.000Z');
      const expectedLoginExpiryDate = new Date('2020-06-01T11:00:00.000Z');

      vi.setSystemTime(loginDate);
      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      const profile = await model.getProfileByConsumer('consumer-1');
      expect(profile).toMatchObject({
        profileName: 'Test Person',
        serviceIds: [SERVICE_A.serviceId],
      });

      expect(profile?.loginExpiryDate).toStrictEqual(expectedLoginExpiryDate);
    });
  });

  describe('storeNotifications', () => {
    it('only updates content.services keys that are allowed by service_ids', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);
      await model.storeNotifications(profileId, [SERVICE_A, SERVICE_B]);

      const row = await db
        .select({ content: notificationsTable.content })
        .from(notificationsTable)
        .limit(1);

      expect(row).toHaveLength(1);

      const services = row[0]?.content?.services ?? {};
      expect(Object.keys(services)).toStrictEqual([SERVICE_A.serviceId]);
    });

    it('adds content.services that were not previously present and does not remove existing ones', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
        SERVICE_B.serviceId,
      ]);

      await model.storeNotifications(profileId, [SERVICE_A]);
      await model.storeNotifications(profileId, [SERVICE_B]);

      const row = await db
        .select({ content: notificationsTable.content })
        .from(notificationsTable)
        .limit(1);
      expect(row).toHaveLength(1);

      const services = row[0]?.content?.services ?? {};
      expect(Object.keys(services)).toStrictEqual(
        expect.arrayContaining([SERVICE_A.serviceId, SERVICE_B.serviceId])
      );
    });
  });

  describe('consumer details table (phase 2 additive)', () => {
    it('rejects linking consumer details via profile_id instead of notification row id', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-legacy', [
        SERVICE_A.serviceId,
      ]);

      const notificationRows = await db
        .select({
          id: notificationsTable.id,
          profileId: notificationsTable.profileId,
        })
        .from(notificationsTable)
        .limit(1);

      expect(notificationRows).toHaveLength(1);
      const notificationRow = notificationRows[0];
      expect(notificationRow).toBeDefined();

      await expect(
        db.insert(notificationsConsumerDetailsTable).values({
          consumerId: 'consumer-links-via-notification-row-id',
          notificationRowId: notificationRow.profileId,
          loginExpiryDate: addMonths(DEFAULT_TIME, 3),
        })
      ).rejects.toThrow();
    });
  });

  describe('listProfiles', () => {
    it('paginates profiles with linked consumers and excludes profiles without consumers', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      const now = addDays(DEFAULT_TIME, 9);

      await db.insert(notificationsTable).values([
        {
          id: 'id-1',
          profileId: '1',
          dateCreated: addHours(DEFAULT_TIME, 1),
        },
        {
          id: 'id-2',
          profileId: '2',
          dateCreated: DEFAULT_TIME,
        },
        {
          id: 'id-3',
          profileId: '3',
          dateCreated: addHours(DEFAULT_TIME, 2),
        },
        {
          id: 'id-4',
          profileId: '4',
          dateCreated: addHours(DEFAULT_TIME, 3),
        },
      ]);

      await db.insert(notificationsConsumerDetailsTable).values([
        {
          consumerId: 'consumer-1-second',
          notificationRowId: 'id-1',
          loginExpiryDate: addMonths(DEFAULT_TIME, 2),
        },
        {
          consumerId: 'consumer-2-last',
          notificationRowId: 'id-2',
          loginExpiryDate: addMonths(DEFAULT_TIME, 4),
        },
        {
          consumerId: 'consumer-3-first',
          notificationRowId: 'id-3',
          loginExpiryDate: addMonths(DEFAULT_TIME, 1),
        },
      ]);

      vi.setSystemTime(now);

      const firstPage = await model.listProfiles({
        limit: 2,
        offset: 0,
      });
      expect(firstPage).toHaveLength(2);
      expect(firstPage.map((p) => p.profileId)).toStrictEqual(['2', '1']);

      const secondPage = await model.listProfiles({
        limit: 2,
        offset: 2,
      });
      expect(secondPage).toHaveLength(1);
      expect(secondPage[0].profileId).toStrictEqual('3');
    });

    it('orders consumerDetails by earliest loginExpiryDate first', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await db.insert(notificationsTable).values({
        id: 'id-consumer-order',
        profileId: 'consumer-order-profile',
        dateCreated: DEFAULT_TIME,
      });

      await db.insert(notificationsConsumerDetailsTable).values([
        {
          consumerId: 'consumer-latest-expiry',
          notificationRowId: 'id-consumer-order',
          loginExpiryDate: addMonths(DEFAULT_TIME, 3),
        },
        {
          consumerId: 'consumer-earliest-expiry',
          notificationRowId: 'id-consumer-order',
          loginExpiryDate: addMonths(DEFAULT_TIME, 1),
        },
        {
          consumerId: 'consumer-middle-expiry',
          notificationRowId: 'id-consumer-order',
          loginExpiryDate: addMonths(DEFAULT_TIME, 2),
        },
      ]);

      vi.setSystemTime(addDays(DEFAULT_TIME, 9));

      const rows = await model.listProfiles({});

      expect(rows).toHaveLength(1);
      expect(rows[0].consumerDetails.map((c) => c.id)).toStrictEqual([
        'consumer-earliest-expiry',
        'consumer-middle-expiry',
        'consumer-latest-expiry',
      ]);
      expect(rows[0].consumerIds).toStrictEqual([
        'consumer-earliest-expiry',
        'consumer-middle-expiry',
        'consumer-latest-expiry',
      ]);
    });

    it('returns consumers and exposes consumerDetails + consumerIds from the same set', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await db.insert(notificationsTable).values({
        id: 'id-active-consumers',
        profileId: 'profile-active-consumers',
        dateCreated: DEFAULT_TIME,
      });

      await db.insert(notificationsConsumerDetailsTable).values([
        {
          consumerId: 'consumer-active',
          notificationRowId: 'id-active-consumers',
          loginExpiryDate: addMonths(DEFAULT_TIME, 1),
        },
      ]);

      vi.setSystemTime(addDays(DEFAULT_TIME, 9));

      const rows = await model.listProfiles({});

      expect(rows).toHaveLength(1);
      expect(rows[0].consumerDetails).toStrictEqual([
        {
          id: 'consumer-active',
          loginExpiryDate: addMonths(DEFAULT_TIME, 1),
        },
      ]);
      expect(rows[0].consumerIds).toStrictEqual(['consumer-active']);
    });
  });
});
