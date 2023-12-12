import { IS_PG } from './config';
import { FeatureToggle } from '../../../universal/config';

type DBAdapter = {
  query: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryGET: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryALL: (query: string, values?: any[] | undefined) => Promise<unknown>;
};

export const db: () => Promise<DBAdapter> = () => {
  if (FeatureToggle.dbEnabled) {
    return import('./fake-db');
  }
  return   IS_PG ? import('./postgres') : import('./sqlite3');
}

