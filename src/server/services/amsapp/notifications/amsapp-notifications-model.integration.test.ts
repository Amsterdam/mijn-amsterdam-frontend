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

import { NOTIFICATIONS_TABLE_NAME } from './amsapp-notifications-model.ts';
import type {
  BSN,
  NotificationsService,
} from './amsapp-notifications-types.ts';
import { setupPgTestDb } from '../../db/pg-test-utils.ts';

const RUN_DB_TESTS = process.env.RUN_DB_TESTS === 'true';
const describePg = RUN_DB_TESTS ? describe : describe.skip;

describePg('amsapp-notifications-model (postgres integration)', () => {
  let pool: Pool;
  let teardown: (() => Promise<void>) | undefined;

  const databaseName = 'mijnadam_test';
  const tableName = NOTIFICATIONS_TABLE_NAME;
  const databaseTable = `public.${tableName}`;

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
    vi.useFakeTimers();
    const ctx = await setupPgTestDb({
      databaseName,
      envOverrides: { BFF_DB_ENABLED: 'true' },
    });
    pool = ctx.pool;
    teardown = ctx.teardown;

    await import('./amsapp-notifications-model.ts');
  });

  afterAll(async () => {
    vi.useRealTimers();
    try {
      await pool.query(`TRUNCATE TABLE ${databaseTable}`);
    } finally {
      await teardown?.();
    }
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE ${databaseTable}`);
    vi.setSystemTime(new Date(defaultTime));
  });

  describe('upsertConsumer', () => {
    it('inserts/updates consumer_ids and overwrites service_ids', async () => {
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

    it('removes the row when consumer_ids becomes empty', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      const deletedCount = await model.deleteConsumer('consumer-1');
      expect(deletedCount).toBe(1);
      const profilesEmpty = await model.listProfileIds();
      expect(profilesEmpty).toHaveLength(0);
    });
  });

  describe('storeNotifications', () => {
    it('only updates content.services keys that are allowed by service_ids', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);
      await model.storeNotifications(profileId, [SERVICE_A, SERVICE_B]);

      const row = await pool.query(
        `SELECT content FROM ${databaseTable} LIMIT 1`
      );

      expect(row.rows).toHaveLength(1);

      const services = row.rows[0]?.content?.services ?? {};
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

      const row = await pool.query(
        `SELECT content FROM ${databaseTable} LIMIT 1`
      );
      expect(row.rows).toHaveLength(1);

      const services = row.rows[0]?.content?.services ?? {};
      expect(Object.keys(services)).toStrictEqual(
        expect.arrayContaining([SERVICE_A.serviceId, SERVICE_B.serviceId])
      );
    });
  });

  describe('listProfiles', () => {
    it('is ordered on created_at for offset/limit to work properly', async () => {
      const model = await import('./amsapp-notifications-model.ts');

      const insertQuery = `INSERT INTO ${NOTIFICATIONS_TABLE_NAME} (id, profile_id, date_created) VALUES ($1, $2, $3)`;
      await pool.query(insertQuery, [
        'id-1',
        '1',
        new Date('2020-01-01T01:00:00.000Z'),
      ]);
      await pool.query(insertQuery, [
        'id-2',
        '2',
        new Date('2020-01-01T00:00:00.000Z'),
      ]);
      await pool.query(insertQuery, [
        'id-3',
        '3',
        new Date('2020-01-01T02:00:00.000Z'),
      ]);

      const firstPage = await model.listProfiles({ limit: 2, offset: 0 });
      expect(firstPage).toHaveLength(2);
      expect(firstPage.map((p) => p.profileId)).toStrictEqual(
        expect.arrayContaining(['1', '2'])
      );
    });
  });
});
