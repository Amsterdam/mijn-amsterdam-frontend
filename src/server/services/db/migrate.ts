import { resolve } from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { endPool, getPool } from './postgres.ts';

async function runMigrations() {
  const db = drizzle(getPool());

  await migrate(db, {
    migrationsFolder: resolve(process.cwd(), 'drizzle'),
  });
}

try {
  await runMigrations();
  console.log('Drizzle migrations completed successfully.');
} catch (error) {
  console.error('Drizzle migrations failed.', error);
  process.exitCode = 1;
} finally {
  await endPool();
}
