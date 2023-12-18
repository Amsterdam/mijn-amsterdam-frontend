import { IS_DISABLED, IS_PG } from './config';

type DBAdapter = {
  id: string;
  query: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryGET: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryALL: (query: string, values?: any[] | undefined) => Promise<unknown>;
};

export const db: () => Promise<DBAdapter> = () => {
  if (IS_DISABLED) {
    return import('./fake-db');
  }
  return IS_PG ? import('./postgres') : import('./sqlite3');
};
