import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import nock from 'nock';
import type { Pool } from 'pg';

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

/**
 * Truncate all tables in a schema.
 */
export async function truncatePgSchemaTables(
  pool: Pool,
  schemaName = 'public'
) {
  const result = await pool.query<{ tablename: string }>(
    'SELECT tablename FROM pg_tables WHERE schemaname = $1',
    [schemaName]
  );

  if (!result.rows.length) {
    return;
  }

  const fullyQualifiedTableNames = result.rows
    .map(({ tablename }) => `"${schemaName}"."${tablename}"`)
    .join(', ');

  await pool.query(
    `TRUNCATE TABLE ${fullyQualifiedTableNames} RESTART IDENTITY CASCADE`
  );
}

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

async function startPostgresTestContainer(options: {
  databaseName: string;
  username: string;
  password: string;
}): Promise<StartedPostgreSqlContainer> {
  return new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase(options.databaseName)
    .withUsername(options.username)
    .withPassword(options.password)
    .start();
}

function allowDockerEngineNetwork(host: string) {
  const normalizedHost = host.toLowerCase();

  return (
    normalizedHost === 'localhost' ||
    normalizedHost === 'localhost:80' ||
    normalizedHost === '127.0.0.1' ||
    normalizedHost === '127.0.0.1:80' ||
    normalizedHost === '::1' ||
    normalizedHost === '[::1]' ||
    normalizedHost === '[::1]:80' ||
    normalizedHost.includes('/var/run/docker.sock')
  );
}

// Open net access only while Testcontainers talks to the Docker engine.
function withDockerNetworkAccess<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
) {
  return async (...args: TArgs): Promise<TResult> => {
    nock.enableNetConnect(allowDockerEngineNetwork);
    try {
      return await fn(...args);
    } finally {
      nock.disableNetConnect();
    }
  };
}

/**
 * Bootstraps a Postgres database for integration tests.
 *
 * - Starts an ephemeral Postgres test container
 * - Applies env overrides (and returns a restore function)
 * - Returns the app's Postgres singleton pool (and a teardown helper)
 */
export async function setupPgTestDb(
  options: PgTestDbOptions = {}
): Promise<PgTestDbContext> {
  const databaseName = options.databaseName || 'mijnadam_test';
  const username = 'postgres';
  const password = 'postgres';

  let container: StartedPostgreSqlContainer | undefined;
  let restoreEnv: (() => void) | undefined;

  const stopContainer = withDockerNetworkAccess(async () => {
    if (container) {
      await container.stop();
      container = undefined;
    }
  });

  try {
    container = await withDockerNetworkAccess(
      async () =>
        await startPostgresTestContainer({
          databaseName,
          username,
          password,
        })
    )();

    restoreEnv = applyEnvOverrides({
      ...options.envOverrides,
      PGHOST: container.getHost(),
      PGPORT: String(container.getPort()),
      PGUSER: container.getUsername(),
      PGPASSWORD: container.getPassword(),
      PGDATABASE: container.getDatabase(),
    });

    const postgres = await import('./postgres.ts');
    // If a previous test did not end the pool, or env changed, allow recreation.
    await postgres.endPool();

    const pool = postgres.getPool();
    await pool.query('SELECT 1');

    const teardown = async () => {
      await postgres.endPool();
      await stopContainer();
      restoreEnv?.();
    };

    return {
      databaseName,
      pool,
      restoreEnv: restoreEnv ?? (() => undefined),
      teardown,
    };
  } catch (error) {
    await stopContainer();
    restoreEnv?.();
    throw error;
  }
}
