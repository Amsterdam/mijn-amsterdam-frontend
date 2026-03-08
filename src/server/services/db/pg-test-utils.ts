import { Pool } from 'pg';

import { pgDbConfig } from './postgres';

type EnvOverrides = Record<string, string | undefined>;

export type PgTestDbOptions = {
  databaseName?: string;
  adminDatabaseName?: string;
  envOverrides?: EnvOverrides;
};

export type PgTestDbContext = {
  databaseName: string;
  pool: Pool;
  restoreEnv: () => void;
  teardown: () => Promise<void>;
};

function restoreEnvSnapshot(snapshot: NodeJS.ProcessEnv) {
  for (const key of Object.keys(process.env)) {
    if (!(key in snapshot)) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function applyEnvOverrides(envOverrides: EnvOverrides | undefined) {
  const snapshot = { ...process.env };
  if (envOverrides) {
    for (const [key, value] of Object.entries(envOverrides)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
  return () => restoreEnvSnapshot(snapshot);
}

async function ensureDatabaseExists(options: {
  databaseName: string;
  adminDatabaseName: string;
}) {
  const adminPool = new Pool({
    ...pgDbConfig,
    database: options.adminDatabaseName,
  });

  try {
    const exists = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [options.databaseName]
    );

    if (exists.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE "${options.databaseName}"`);
    }
  } finally {
    await adminPool.end();
  }
}

/**
 * Bootstraps a Postgres database for integration tests.
 *
 * - Ensures the database exists (creates it if needed)
 * - Applies env overrides (and returns a restore function)
 * - Returns the app's Postgres singleton pool (and a teardown helper)
 */
export async function setupPgTestDb(
  options: PgTestDbOptions = {}
): Promise<PgTestDbContext> {
  const databaseName = options.databaseName || 'mijnadam_test';
  const adminDatabaseName = options.adminDatabaseName || 'postgres';

  const restoreEnv = applyEnvOverrides({
    ...options.envOverrides,
    PGDATABASE: databaseName,
  });

  try {
    await ensureDatabaseExists({ databaseName, adminDatabaseName });

    const postgres = await import('./postgres');
    // If a previous test ended the pool, or env changed, allow recreation.
    await postgres.endPool();

    const pool = postgres.getPool();
    await pool.query('SELECT 1');

    const teardown = async () => {
      await postgres.endPool();
      restoreEnv();
    };

    return { databaseName, pool, restoreEnv, teardown };
  } catch (error) {
    restoreEnv();
    throw error;
  }
}
