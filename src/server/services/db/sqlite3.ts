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

export function execDB(query: string) {
  return db.exec(query);
}

process.on('beforeExit', () => {
  db.close();
});
