// Modules are imported inside try/catch to enable captureException handling the errors.
// As few modules as possible are imported to avoid potential errors in modules that are not needed for the job.
const JOB_SUCCESS_CODE = 0;
const JOB_FAILURE_CODE = 1;
const MINUTE_IN_MS = 60 * 1000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function trackEventStarted() {
  const { trackEvent } = await import('../server/services/monitoring.ts');
  trackEvent('job-fetch-notifications-amsapp-started', {
    type: 'job',
    name: 'fetch-notifications-amsapp',
    status: 'started',
  });
}

async function trackEventSucceeded() {
  const { trackEvent } = await import('../server/services/monitoring.ts');
  trackEvent('job-fetch-notifications-amsapp-success', {
    type: 'job',
    name: 'fetch-notifications-amsapp',
    status: 'success',
  });
}

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
    // Keep this import first so environment variables are loaded before other modules.
    await import('../server/helpers/load-env.ts');
  } catch (error) {
    // Without environment variables, capturing the exception is not possible
    console.error(
      'job-fetch-notifications-amsapp: Failed to load environment variables',
      error
    );
    throw error;
  }

  try {
    await trackEventStarted();

    const { batchFetchAndStoreNotifications } =
      await import('../server/services/amsapp/notifications/amsapp-notifications.ts');
    await batchFetchAndStoreNotifications();

    // We close the Postgres pool to ensure the process can exit cleanly.
    const { endPool } = await import('../server/services/db/postgres.ts');
    await endPool();

    await trackEventSucceeded();
  } catch (error) {
    await captureException(error);
    throw error;
  }
}

runJob()
  .then(async () => {
    // Ensure any event is sent before the process exits
    await delay(MINUTE_IN_MS);
    process.exit(JOB_SUCCESS_CODE);
  })
  .catch(async () => {
    // Ensure any event is sent before the process exits
    await delay(MINUTE_IN_MS);
    process.exit(JOB_FAILURE_CODE);
  });
