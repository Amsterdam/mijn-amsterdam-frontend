import { IS_AP } from '../../../universal/config';

type DBAdapter = {
  tableNameLoginCount: string;
  query: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryGET: (query: string, values?: any[] | undefined) => Promise<unknown>;
};

export const db: () => Promise<DBAdapter> = () =>
  IS_AP ? import('./postgres') : import('./sqlite3');
