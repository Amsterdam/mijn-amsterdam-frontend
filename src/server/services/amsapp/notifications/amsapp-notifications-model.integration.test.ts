import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { NOTIFICATIONS_TABLE_NAME } from './amsapp-notifications-model';
import type { BSN, NotificationsService } from './amsapp-notifications-types';
import { setupPgTestDb } from '../../db/pg-test-utils';

const RUN_DB_TESTS = process.env.RUN_DB_TESTS === 'true';
const describePg = RUN_DB_TESTS ? describe : describe.skip;

describePg('amsapp-notifications-model (postgres integration)', () => {
  let pool: import('pg').Pool;
  let teardown: (() => Promise<void>) | undefined;

  const databaseName = process.env.PGDATABASE || 'mijnadam_test';
  const tableName = NOTIFICATIONS_TABLE_NAME;
  const databaseTable = `public.${tableName}`;

  const profileId: BSN = '999999999' as BSN;

  const SERVICE_A: NotificationsService = {
    serviceId: 'afis',
    dateUpdated: '2000-01-01T00:00:00.000Z',
    status: 'OK',
    content: [],
  };
  const SERVICE_B: NotificationsService = {
    serviceId: 'avg',
    dateUpdated: '2001-21-21T00:00:00.000Z',
    status: 'OK',
    content: [],
  };

  beforeAll(async () => {
    const ctx = await setupPgTestDb({
      databaseName,
      envOverrides: { BFF_DB_ENABLED: 'true' },
    });
    pool = ctx.pool;
    teardown = ctx.teardown;

    // Ensure table exists (model will set it up on import when DB is enabled)
    await import('./amsapp-notifications-model');
  });

  beforeEach(async () => {
    await pool.query(`TRUNCATE TABLE ${databaseTable}`);
  });

  afterAll(async () => {
    try {
      await pool.query(`TRUNCATE TABLE ${databaseTable}`);
    } finally {
      await teardown?.();
    }
  });

  describe('upsertConsumer', () => {
    it('inserts/updates consumer_ids and overwrites service_ids', async () => {
      const model = await import('./amsapp-notifications-model');

      await model.upsertConsumer(profileId, 'Test Person', 'consumer-1', [
        SERVICE_A.serviceId,
      ]);

      const rows1 = await model.listProfileIds();
      expect(rows1).toHaveLength(1);
      expect(rows1[0]).toMatchObject({
        profileId: '999999999',
        profileName: 'Test Person',
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
        profileName: 'Test Person',
        consumerIds: expect.arrayContaining(['consumer-1', 'consumer-2']),
        serviceIds: [SERVICE_B.serviceId],
      });
    });
  });

  describe('deleteConsumer', () => {
    it('removes the consumer when there is more than one consumer', async () => {
      const model = await import('./amsapp-notifications-model');

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
      const model = await import('./amsapp-notifications-model');

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
      const model = await import('./amsapp-notifications-model');

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
      const model = await import('./amsapp-notifications-model');

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
});
