import { IS_PG } from './config';

type DBAdapter = {
  query: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryGET: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryALL: (query: string, values?: any[] | undefined) => Promise<unknown>;
};

export const db: () => Promise<DBAdapter> = () =>
  IS_PG ? import('./postgres') : import('./sqlite3');
