import * as Sentry from '@sentry/node';
import { Pool, ClientConfig } from 'pg';

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

export async function query(query: string, values?: any[]) {
  let result = null;
  try {
    if (!isConnected) {
      await pool.connect();
      isConnected = true;
    }
    result = await pool.query(query, values);
  } catch (error) {
    Sentry.captureException(error);
  }
  return result;
}

process.on('beforeExit', () => {
  pool.end();
});
