/* eslint-disable no-console */
import path, { resolve } from 'node:path';

// File: Logger is not emitting when called from the migrate pipeline so console.log is used instead

async function checkDatabaseConnectivity() {
  const { getPool } = await import('./postgres.ts');
  return await getPool().query('SELECT 1;');
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

  const [{ captureException }, { endPool }] = await Promise.all([
    import('../monitoring.ts'),
    import('./postgres.ts'),
  ]);

  try {
    await checkDatabaseConnectivity();
    console.log('Database migration connectivity pre-check succeeded.');
  } catch (error) {
    console.log('Database migration connectivity pre-check failed.');
    captureException(error, {
      properties: {
        message: 'Database migration connectivity pre-check failed.',
        module: 'database',
      },
    });
    throw error;
  } finally {
    await endPool();
  }

  try {
    await runMigrations();
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.log('Database migration Error.');
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
  } catch {
    process.exit(1);
  }
}
