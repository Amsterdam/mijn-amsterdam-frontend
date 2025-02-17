import memoizee from 'memoizee';

import { IS_DB_ENABLED } from './config';
import { log } from '../../logging';

type DBAdapter = {
  id: string;
  query: (query: string, values?: unknown[] | undefined) => Promise<unknown>;
  queryGET: (query: string, values?: unknown[] | undefined) => Promise<unknown>;
  queryALL: (query: string, values?: unknown[] | undefined) => Promise<unknown>;
};

const db_: () => Promise<DBAdapter> = () => {
  if (!IS_DB_ENABLED) {
    return import('./fake-db').finally(() => {
      log.info('Using Fake DB');
    });
  }
  return import('./postgres').finally(() => {
    log.info('Using Postgres DB');
  });
};

export const db = memoizee(db_);
