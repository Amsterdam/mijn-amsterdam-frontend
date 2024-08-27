import { IS_ENABLED, IS_PG } from './config';

type DBAdapter = {
  id: string;
  query: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryGET: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryALL: (query: string, values?: any[] | undefined) => Promise<unknown>;
};

export const db: () => Promise<DBAdapter> = () => {
  if (!IS_ENABLED) {
    return import('./fake-db');
  }
  return IS_PG ? import('./postgres') : import('./sqlite3');
};
