import { resolve } from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { getPool } from './postgres.ts';

export async function runMigrations() {
  const db = drizzle(getPool());

  await migrate(db, {
    migrationsFolder: resolve(process.cwd(), 'drizzle'),
  });
}
