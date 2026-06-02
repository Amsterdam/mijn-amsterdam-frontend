import { resolve } from 'node:path';

import { addMonths } from 'date-fns';
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

const RUN_DB_TESTS = process.env.RUN_DB_TESTS === 'true';
const describePg = RUN_DB_TESTS ? describe : describe.skip;

describePg('amsapp-notifications-model (postgres integration)', () => {
  let pool: Pool;
  let db: ReturnType<typeof drizzle>;
  let teardown: (() => Promise<void>) | undefined;

  const databaseName = 'mijnadam_test';

  const profileId: BSN = '999999999' as BSN;

  const defaultTime = '2020-01-01T00:00:00.000Z';
  const defaultTimePlusHour = '2020-01-01T01:00:00.000Z';

  const SERVICE_A: NotificationsService = {
    serviceId: 'afis',
    dateUpdated: defaultTime,
    status: 'OK',
    content: [],
  };
  const SERVICE_B: NotificationsService = {
    serviceId: 'avg',
    dateUpdated: defaultTimePlusHour,
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
    vi.setSystemTime(new Date(defaultTime));
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

      vi.setSystemTime(new Date('2020-01-31T10:00:00.000Z'));
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
      expect(firstLoginExpiryDate?.toISOString()).toBe(
        addMonths(new Date('2020-01-31T10:00:00.000Z'), 3).toISOString()
      );

      vi.setSystemTime(new Date('2020-02-29T10:00:00.000Z'));
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
      expect(secondLoginExpiryDate?.toISOString()).toBe(
        addMonths(new Date('2020-02-29T10:00:00.000Z'), 3).toISOString()
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
    it('returns the total profile count', async () => {
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

    it('returns the total profile count after dateFrom', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      vi.setSystemTime(new Date(defaultTime));
      await model.upsertConsumer('1', 'Test Person 1', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      vi.setSystemTime(new Date(defaultTimePlusHour));
      await model.upsertConsumer('2', 'Test Person 2', 'consumer-2', [
        SERVICE_A.serviceId,
      ]);

      const totalItems = await model.getProfilesCount({
        dateFrom: defaultTimePlusHour,
      });
      expect(totalItems).toBe(1);
    });
  });

  describe('deleteConsumer', () => {
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

      await model.deleteConsumer('consumer-2');
      const profilesWithOneConsumer = await model.listProfileIds();
      expect(profilesWithOneConsumer).toHaveLength(1);
      expect(profilesWithOneConsumer[0].consumerIds).toHaveLength(1);
    });

    it('removes the row when the last consumer detail is deleted', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      const deletedCount = await model.deleteConsumer('consumer-1');
      expect(deletedCount).toBe(1);
      const profilesEmpty = await model.listProfileIds();
      expect(profilesEmpty).toHaveLength(0);
    });

    it('deletes orphaned profile when the last consumer detail is removed', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer('1', 'Test Person 1', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      await model.deleteConsumer('consumer-1');

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
          loginExpiryDate: new Date('2020-04-01T00:00:00.000Z'),
        })
      ).rejects.toThrow();
    });
  });

  describe('listProfiles', () => {
    it('is ordered on created_at for offset/limit to work properly', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await db.insert(notificationsTable).values([
        {
          id: 'id-1',
          profileId: '1',
          dateCreated: new Date('2020-01-01T01:00:00.000Z'),
        },
        {
          id: 'id-2',
          profileId: '2',
          dateCreated: new Date('2020-01-01T00:00:00.000Z'),
        },
        {
          id: 'id-3',
          profileId: '3',
          dateCreated: new Date('2020-01-01T02:00:00.000Z'),
        },
      ]);

      const firstPage = await model.listProfiles({ limit: 2, offset: 0 });
      expect(firstPage).toHaveLength(2);
      expect(firstPage.map((p) => p.profileId)).toStrictEqual(
        expect.arrayContaining(['1', '2'])
      );
    });
  });
});
