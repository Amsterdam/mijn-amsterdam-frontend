import * as Sentry from '@sentry/node';
import { ClientConfig, Pool } from 'pg';
import { IS_PRODUCTION } from '../../universal/config';

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
export const tableNameLoginCount =
  process.env.BFF_LOGIN_COUNT_TABLE ??
  (IS_PRODUCTION ? 'prod_login_count' : 'acc_login_count');

const createTableQuery = `
-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS ${tableNameLoginCount}_id_seq;

-- Table Definition
CREATE TABLE IF NOT EXISTS "public"."${tableNameLoginCount}" (
    "id" int4 NOT NULL DEFAULT nextval('${tableNameLoginCount}_id_seq'::regclass),
    "uid" varchar(100) NOT NULL,
    "authMethod" varchar(100) NOT NULL,
    "date_created" timestamp NOT NULL DEFAULT now(),
    PRIMARY KEY ("id")
);
`;

const alterTableQuery1 = `
  ALTER TABLE IF EXISTS "public"."${tableNameLoginCount}"
  ADD IF NOT EXISTS "authMethod" VARCHAR(100);
`;

if (IS_PRODUCTION) {
  (function setupTable() {
    pool.query(createTableQuery, (err, res) => {
      console.log(err, res);
    });
    pool.query(alterTableQuery1, (err, res) => {
      console.log(err, res);
    });
  })();
}

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
