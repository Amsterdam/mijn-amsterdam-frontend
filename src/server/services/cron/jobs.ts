import { CronJob } from 'cron';
import { cleanupSessionIds } from '../session-blacklist';

// Runs at midnight. See: https://github.com/kelektiv/node-cron/blob/main/examples/at_midnight.js
export const cleanupSessionBlacklistTable = new CronJob(
  '00 00 00 * * *',
  function () {
    cleanupSessionIds();
  }
);
