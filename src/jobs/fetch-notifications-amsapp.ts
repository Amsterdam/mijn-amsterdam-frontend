// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../mijnamsterdam.d.ts" />

import { captureException } from '../server/services/monitoring';
import { batchFetchAndStoreNotifications } from '../server/services/notifications/notifications';

async function runJob() {
  try {
    await batchFetchAndStoreNotifications();
  } catch (e) {
    captureException(e, {
      properties: {
        type: 'job',
        function: 'batchFetchAndStoreNotifications',
        message: 'Job batchFetchAndStoreNotificiation failed',
      },
      tags: { type: 'job', context: 'amsapp', service: 'notification' },
    });
    throw e; // Rethrow to make the pipeline fail
  }
}
runJob();
