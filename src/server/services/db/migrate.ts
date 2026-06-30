// Logger is not emitting when called from the migrate pipeline so console.log is used instead
/* eslint-disable no-console */
import path, { resolve } from 'node:path';

const JOB_SUCCESS_CODE = 0;
const JOB_FAILURE_CODE = 1;

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
    name: 'database-migration-started',
    message: 'Database migration started.',
    module: 'database',
  });

  try {
    await checkDatabaseConnectivity();
    console.log('Database migration connectivity pre-check succeeded.');
    trackEvent('Database migration connectivity pre-check succeeded.', {
      name: 'database-migration-connectivity-pre-check-succeeded',
      message: 'Database migration connectivity pre-check succeeded.',
      module: 'database',
    });
  } catch (error) {
    console.log('Database migration connectivity pre-check failed.');
    captureException(error, {
      properties: {
        name: 'database-migration-connectivity-pre-check-failed',
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
      name: 'database-migration-completed',
      message: 'Database migration completed successfully.',
      module: 'database',
    });
  } catch (error) {
    console.log('Database migration failed.');
    captureException(error, {
      properties: {
        name: 'database-migration-failed',
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
  let exitCode = JOB_SUCCESS_CODE;

  try {
    await runMigrationsCommand();
  } catch {
    exitCode = JOB_FAILURE_CODE;
  } finally {
    const { flushTelemetry } = await import('../monitoring.ts');

    // Flush telemetry before exiting so events and exceptions are sent.
    await flushTelemetry();
    process.exit(exitCode);
  }
}
