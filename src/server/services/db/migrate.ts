// Logger is not emitting when called from the migrate pipeline so console.log is used instead
/* eslint-disable no-console */
import path, { resolve } from 'node:path';

import { delay } from '../../../universal/helpers/utils.ts';

const JOB_SUCCESS_CODE = 0;
const JOB_FAILURE_CODE = 1;
const ONE_MINUTE_MS = 60 * 1000;

async function checkDatabaseConnectivity() {
  const { getPool } = await import('./postgres.ts');
  return getPool().query('SELECT 1;');
}

export async function runMigrations() {
  const [{ drizzle }, { migrate }, { getPool }] = await Promise.all([
    import('drizzle-orm/node-postgres'),
    import('drizzle-orm/node-postgres/migrator'),
    import('./postgres.ts'),
  ]);

  const db = drizzle(getPool());

  await migrate(db, {
    migrationsFolder: resolve(process.cwd(), 'db-migrations'),
  });
}

export async function runMigrationsCommand() {
  await import('../../helpers/load-env.ts');

  const [{ captureException, trackEvent }, { endPool }] = await Promise.all([
    import('../monitoring.ts'),
    import('./postgres.ts'),
  ]);

  console.log('Database migration started.');
  trackEvent('Database migration started', {
    properties: {
      message: 'Database migration started.',
      module: 'database',
    },
  });

  try {
    await checkDatabaseConnectivity();
    console.log('Database migration connectivity pre-check succeeded.');
    trackEvent('Database migration connectivity pre-check succeeded.', {
      properties: {
        message: 'Database migration connectivity pre-check succeeded.',
        module: 'database',
      },
    });
  } catch (error) {
    console.log('Database migration connectivity pre-check failed.');
    captureException(error, {
      properties: {
        message: 'Database migration connectivity pre-check failed.',
        module: 'database',
      },
    });
    await endPool();
    throw error;
  }
  try {
    await runMigrations();
    console.log('Database migration completed successfully.');
    trackEvent('Database migration completed successfully.', {
      properties: {
        message: 'Database migration completed successfully.',
        module: 'database',
      },
    });
  } catch (error) {
    console.log('Database migration failed.');
    captureException(error, {
      properties: {
        message: 'Database migration failed.',
        module: 'database',
      },
    });
    throw error;
  } finally {
    await endPool();
  }
}

const scriptName = path.parse(process.argv.at(1) ?? '').name;

if (import.meta.main || scriptName === 'migrate') {
  try {
    await runMigrationsCommand();
    await delay(ONE_MINUTE_MS);
    process.exit(JOB_SUCCESS_CODE);
  } catch {
    // Ensure any event is sent before the process exits
    await delay(ONE_MINUTE_MS);
    process.exit(JOB_FAILURE_CODE);
  }
}
