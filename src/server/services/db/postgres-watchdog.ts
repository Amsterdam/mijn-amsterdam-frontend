import { APP_MODE } from '../../../universal/config/env.ts';
import { captureException } from '../monitoring.ts';
import { IS_DB_ENABLED } from './config.ts';
import type { DBAdapter } from './db.ts';

const DB_WATCHDOG_INTERVAL_MS = 60_000;
const DB_WATCHDOG_QUERY_TIMEOUT_MS = 3_000;
const DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES = 5;

let dbWatchdogInterval: NodeJS.Timeout | null = null;
let consecutiveFailures = 0;
let lastError: unknown;

function registerPingFailure(error: unknown) {
  lastError = error;
  consecutiveFailures += 1;

  captureException(lastError, {
    properties: {
      type: 'db',
      name: 'db-watchdog-ping-failed',
      message: 'DB watchdog ping failed',
      severity: 'error',
    },
  });

  if (consecutiveFailures < DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES) {
    return;
  }

  captureException(lastError, {
    properties: {
      type: 'db',
      name: 'db-watchdog-ping-failed-max-retries',
      message: 'DB watchdog ping failed max consecutive times, exiting process',
      severity: 'error',
      intervalMs: DB_WATCHDOG_INTERVAL_MS,
      timeoutMs: DB_WATCHDOG_QUERY_TIMEOUT_MS,
    },
  });

  process.exit(1);
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`DB ping timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => resolve(value))
      .catch((error) => reject(error))
      .finally(() => clearTimeout(timeout));
  });
}

export function stopDbWatchdog() {
  if (!dbWatchdogInterval) {
    return;
  }

  clearInterval(dbWatchdogInterval);
  dbWatchdogInterval = null;
  consecutiveFailures = 0;
  lastError = undefined;
}

export function startDbWatchdog(getPool: () => DBAdapter) {
  if (dbWatchdogInterval) {
    return;
  }

  const isEnabled = IS_DB_ENABLED && APP_MODE !== 'unittest';
  if (!isEnabled) {
    return;
  }

  dbWatchdogInterval = setInterval(async () => {
    try {
      const pool = getPool();
      await withTimeout(pool.query('SELECT 1'), DB_WATCHDOG_QUERY_TIMEOUT_MS);
      consecutiveFailures = 0;
      lastError = undefined;
    } catch (error) {
      registerPingFailure(error);
    }
  }, DB_WATCHDOG_INTERVAL_MS);

  dbWatchdogInterval.unref?.();
}
