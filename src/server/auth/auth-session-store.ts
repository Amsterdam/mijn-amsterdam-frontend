import SqliteStoreModule from 'better-sqlite3-session-store';

import { db } from '../services/db/db';
import { OIDC_SESSION_MAX_AGE_SECONDS } from './auth-config';

export function getSessionStore<T>(auth: T) {
  return new SqliteStoreModule(auth)({
    client: db,
    expired: {
      clear: true,
      intervalMs: OIDC_SESSION_MAX_AGE_SECONDS * 1000,
    },
  });
}
