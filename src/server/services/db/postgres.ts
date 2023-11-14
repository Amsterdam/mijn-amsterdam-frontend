import * as Sentry from '@sentry/node';
import { ClientConfig, Pool } from 'pg';
import { IS_PRODUCTION } from '../../../universal/config/env';

export const pgDbConfig: ClientConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
};

const pool = new Pool(pgDbConfig);
let isConnected = false;

/**
 * To develop against a working database you should enable the Datapunt VPN and use the credentials for the connection in your env.local file.
 */

export async function query(queryString: string, values?: any[]) {
  let result = null;
  try {
    if (!isConnected) {
      await pool.connect();
      isConnected = true;
    }
    result = await pool.query(queryString, values);
  } catch (error) {
    Sentry.captureException(error);
  }
  return result;
}

export async function queryGET(queryString: string, values?: any[]) {
  const result = await query(queryString, values);
  return result?.rows[0] ?? null;
}

export async function queryALL(queryString: string, values?: any[]) {
  const result = await query(queryString, values);
  return result?.rows ?? [];
}

process.on('beforeExit', () => {
  pool.end();
});
