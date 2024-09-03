import SqliteStoreModule from 'better-sqlite3-session-store';

import { auth } from 'express-openid-connect';
import { db } from '../services/db/db';
import { OIDC_SESSION_MAX_AGE_SECONDS } from './auth-config';

const SqliteStore = SqliteStoreModule(auth);
export const sessionStore = new SqliteStore({
  client: db,
  expired: {
    clear: true,
    intervalMs: OIDC_SESSION_MAX_AGE_SECONDS * 1000,
  },
});
