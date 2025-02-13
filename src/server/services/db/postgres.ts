import { PoolConfig, Pool } from 'pg';

import { captureException } from '../monitoring';

// Connection params are taken from env variables.
export const pgDbConfig: PoolConfig = {
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

let pool: Pool | null;

export function getPool() {
  if (pool) {
    return pool;
  }
  pool = new Pool(pgDbConfig);
  return pool;
}

/**
 * To develop against a working database you should enable the Datapunt VPN and use the credentials for the connection in your env.local file.
 */

export async function query(queryString: string, values?: unknown[]) {
  let result = null;

  try {
    const pool = getPool();
    result = await pool.query(queryString, values);
  } catch (error) {
    captureException(error);
  }

  return result;
}

export async function queryGET(queryString: string, values?: unknown[]) {
  const result = await query(queryString, values);
  return result?.rows[0] ?? null;
}

export async function queryALL(queryString: string, values?: unknown[]) {
  const result = await query(queryString, values);
  return result?.rows ?? [];
}

export const id = 'postgres';

process.on('beforeExit', () => {
  pool?.end();
});
