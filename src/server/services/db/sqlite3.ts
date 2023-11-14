import Database from 'better-sqlite3';
import { IS_VERBOSE } from './config';

export const tableNameLoginCount =
  process.env.BFF_LOGIN_COUNT_TABLE ?? 'login_count';

const SQLITE3_DB_PATH_FILE = `${process.env.BFF_DB_FILE}`;

const dbOptions: Database.Options = {
  verbose: IS_VERBOSE ? console.log : undefined,
};

const db = new Database(SQLITE3_DB_PATH_FILE, dbOptions);

// https://github.com/WiseLibs/better-sqlite3/blob/master/docs/performance.md
db.pragma('journal_mode = WAL');

// Create the table
db.exec(`
CREATE TABLE IF NOT EXISTS ${tableNameLoginCount} (
    "id" INTEGER PRIMARY KEY,
    "uid" VARCHAR(100) NOT NULL,
    "date_created" DATETIME NOT NULL DEFAULT (datetime(CURRENT_TIMESTAMP, 'localtime')),
    "auth_method" VARCHAR(100) DEFAULT NULL
);
`);

export async function query(
  query: string,
  values?: any[]
): Promise<Database.RunResult> {
  const statement = db.prepare(query);
  if (Array.isArray(values)) {
    return statement.run(...values);
  }
  return statement.run();
}

export async function queryGET(
  query: string,
  values?: any[]
): Promise<unknown> {
  const statement = db.prepare(query);
  if (Array.isArray(values)) {
    return statement.get(...values);
  }
  return statement.get();
}

export async function queryALL(
  query: string,
  values?: any[]
): Promise<unknown> {
  const statement = db.prepare(query);
  if (Array.isArray(values)) {
    return statement.all(...values);
  }
  return statement.all();
}

process.on('beforeExit', () => {
  db.close();
});
