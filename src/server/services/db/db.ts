import { IS_DB_ENABLED } from './config';

type DBAdapter = {
  id: string;
  query: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryGET: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryALL: (query: string, values?: any[] | undefined) => Promise<unknown>;
};

export const db: () => Promise<DBAdapter> = () => {
  if (!IS_DB_ENABLED) {
    return import('./fake-db').finally(() => {
      console.info('Using Fake DB');
    });
  }
  return import('./postgres').finally(() => {
    console.info('Using Postgres DB');
  });
};
