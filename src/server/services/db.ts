import * as Sentry from '@sentry/node';
import { Client, ClientConfig } from 'pg';

export const pgDbConfig: ClientConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
};

const client = new Client(pgDbConfig);
let isConnected = false;

export async function query(query: string, values?: any[]) {
  let result = null;
  try {
    if (!isConnected) {
      await client.connect();
      isConnected = true;
    }
    result = await client.query(query, values);
    // await pool.end();
  } catch (error) {
    Sentry.captureException(error);
  }
  return result;
}
