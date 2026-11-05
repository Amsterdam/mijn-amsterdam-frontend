import { APP_MODE } from '../../../universal/config/env.ts';
import { delay } from '../../../universal/helpers/utils.ts';
import { captureException } from '../monitoring.ts';
import { IS_DB_ENABLED } from './config.ts';

const DELAY_BEFORE_EXIT_MS = 15_000;
const JOB_FAILED_CODE = 1;

const DB_WATCHDOG_INTERVAL_MS = 60_000;
const DB_WATCHDOG_QUERY_TIMEOUT_MS = 5_000;
const DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES = 5;

let dbWatchdogInterval: NodeJS.Timeout | null = null;
let consecutiveFailures = 0;
let lastError: unknown;

function resetDbWatchdog() {
  consecutiveFailures = 0;
  lastError = undefined;
}

async function registerPingFailure(error: unknown) {
  lastError = new Error('Database ping failed', {
    cause: error,
  });
  consecutiveFailures += 1;

  if (consecutiveFailures < DB_WATCHDOG_MAX_CONSECUTIVE_FAILURES) {
    captureException(lastError, {
      properties: {
        type: 'db',
        name: 'db-watchdog-ping-failed',
        message: 'DB watchdog ping failed',
        consecutiveFailures,
      },
      severity: 'error',
    });
    return;
  }

  captureException(lastError, {
    properties: {
      type: 'db',
      name: 'db-watchdog-ping-failed-max-retries',
      message: 'DB watchdog ping failed max consecutive times, exiting process',
    },
    severity: 'error',
  });

  // Ensure captureException is sent before the process exits
  await delay(DELAY_BEFORE_EXIT_MS);
  process.exit(JOB_FAILED_CODE);
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
  resetDbWatchdog();
}

type PoolLike = { query: (query: string) => Promise<unknown> };
export function startDbWatchdog(getPool: () => PoolLike) {
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
      resetDbWatchdog();
    } catch (error) {
      registerPingFailure(error);
    }
  }, DB_WATCHDOG_INTERVAL_MS);

  dbWatchdogInterval.unref?.();
}
