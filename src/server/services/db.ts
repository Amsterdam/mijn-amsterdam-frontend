import Database from 'better-sqlite3';
import { IS_DEVELOPMENT } from '../../universal/config';

export const tableNameLoginCount =
  process.env.BFF_LOGIN_COUNT_TABLE ?? 'login_count';

const SQLITE3_DB_PATH = `${process.env.DB_PATH}`;

const dbOptions: Database.Options = {
  verbose: IS_DEVELOPMENT ? console.log : undefined,
};

const db = new Database(SQLITE3_DB_PATH, dbOptions);

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
  console.log(statement, 'vals:', values);
  if (Array.isArray(values)) {
    return statement.get(...values);
  }
  return statement.get();
}

export async function queryALL(
  query: string,
  values?: any[]
): Promise<unknown[]> {
  const statement = db.prepare(query);
  if (Array.isArray(values)) {
    return statement.all(...values);
  }
  return statement.all();
}

process.on('beforeExit', () => {
  db.close();
});
