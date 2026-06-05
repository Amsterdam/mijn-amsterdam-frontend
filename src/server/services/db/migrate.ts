import path, { resolve } from 'node:path';

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
    await runMigrations();
    // Logger is not emitting when called from the migrate pipeline sow we use console.log
    console.log('Drizzle migrations completed successfully.');
  } catch (error) {
    // Logger is not emitting when called from the migrate pipeline sow we use console.log
    console.log('Drizzle migrations Error.');
    captureException(error, {
      properties: {
        message: 'Drizzle migrations failed.',
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
