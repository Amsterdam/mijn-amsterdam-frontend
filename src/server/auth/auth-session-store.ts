import connectPGSimple from 'connect-pg-simple';
import { Session, SessionStore } from 'express-openid-connect';
import expressSession from 'express-session';
import createMemorystore from 'memorystore';

import { FeatureToggle } from '../../universal/config/feature-toggles';
import { logger } from '../logging';
import { IS_DB_ENABLED } from '../services/db/config';
import { getPool } from '../services/db/postgres';

type SessionStoreOptions = {
  tableName: string;
  maxAgeSeconds: number;
};

export function getSessionStore<T extends typeof expressSession>(
  auth: T,
  options: SessionStoreOptions
): SessionStore<Session> {
  // Use Postgres Database
  if (IS_DB_ENABLED && FeatureToggle.dbSessionsEnabled) {
    logger.info('Using PG sessions DB');
    const pgSession = connectPGSimple(auth);
    return new pgSession({
      tableName: options.tableName,
      pool: getPool(),
      createTableIfMissing: true,
    }) as unknown as SessionStore<Session>;
  }

  const MemoryStore = createMemorystore(auth);
  logger.info('Using sessions MemoryStore');
  return new MemoryStore({
    max: options.maxAgeSeconds,
  }) as unknown as SessionStore<Session>;
}
