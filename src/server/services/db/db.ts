import { IS_PG } from './config';
import { FeatureToggle } from '../../../universal/config';

type DBAdapter = {
  id: string;
  query: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryGET: (query: string, values?: any[] | undefined) => Promise<unknown>;
  queryALL: (query: string, values?: any[] | undefined) => Promise<unknown>;
};

export const db: () => Promise<DBAdapter> = () => {
  if (FeatureToggle.dbDisabled) {
    return import('./fake-db');
  }
  return IS_PG ? import('./postgres') : import('./sqlite3');
};
