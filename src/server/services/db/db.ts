import memoizee from 'memoizee';

import { IS_DB_ENABLED } from './config.ts';
import { logger } from '../../logging.ts';

type DBAdapter = {
  id: string;
  query: (query: string, values?: unknown[] | undefined) => Promise<unknown>;
  queryGET: (query: string, values?: unknown[] | undefined) => Promise<unknown>;
  queryALL: (
    query: string,
    values?: unknown[] | undefined
  ) => Promise<unknown[]>;
};

const db_: () => Promise<DBAdapter> = () => {
  if (!IS_DB_ENABLED) {
    return import('./fake-db.ts').finally(() => {
      logger.info('Using Fake DB');
    });
  }
  return import('./postgres.ts').finally(() => {
    logger.info('Using Postgres DB');
  });
};

export const db = memoizee(db_);
