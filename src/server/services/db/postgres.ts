import { ClientConfig, Pool } from 'pg';

import { getFromEnv } from '../../helpers/env';
import { captureException } from '../monitoring';

export const pgDbConfig: ClientConfig = {
  host: getFromEnv('PGHOST', true),
  port: parseInt(getFromEnv('PGPORT', true) ?? '5432', 10),
  user: getFromEnv('PGUSER', true),
  password: getFromEnv('PGPASSWORD', true),
  database: getFromEnv('PGDATABASE', true),
  ssl: { rejectUnauthorized: false },
};

export const pool = new Pool(pgDbConfig);
let isConnected = false;

/**
 * To develop against a working database you should enable the Datapunt VPN and use the credentials for the connection in your env.local file.
 */

export async function query(queryString: string, values?: unknown[]) {
  let result = null;

  if (!isConnected) {
    await pool.connect();
    isConnected = true;
  }

  try {
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
  pool.end();
});
