async function captureException(error: unknown) {
  const { captureException } = await import('../server/services/monitoring.ts');
  captureException(error, {
    properties: {
      type: 'job',
      name: 'fetch-notifications-amsapp',
      message: 'Job fetch-notifications-amsapp failed',
      severity: 'error',
    },
    tags: { type: 'job', context: 'amsapp', service: 'notification' },
  });
}

async function runJob() {
  try {
    // Keep this import first so env is loaded before other modules.
    await import('../server/helpers/load-env.ts');

    const { batchFetchAndStoreNotifications } =
      (await import('../server/services/amsapp/notifications/amsapp-notifications.ts')) as {
        batchFetchAndStoreNotifications: () => Promise<void>;
      };

    const { endPool } = await import('../server/services/db/postgres.ts');

    try {
      await batchFetchAndStoreNotifications();
    } catch (error) {
      await captureException(error);
      throw error;
    } finally {
      await endPool();
    }
  } catch (error) {
    await captureException(error);
    throw error;
  }
  process.exit(0);
}

runJob().catch(() => process.exit(1));
