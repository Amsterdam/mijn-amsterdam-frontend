import createMemorystore from 'memorystore';
import { OIDC_SESSION_MAX_AGE_SECONDS } from './auth-config';

export function getSessionStore<T>(auth: T) {
  const MemoryStore = createMemorystore(auth);
  return new MemoryStore({
    max: OIDC_SESSION_MAX_AGE_SECONDS,
  });
}
