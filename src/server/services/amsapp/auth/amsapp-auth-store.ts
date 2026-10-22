import { randomUUID } from 'node:crypto';

import { AUTHORIZATION_CODE_TTL_MS } from './amsapp-auth-service-config.ts';
import { OIDC_SESSION_MAX_AGE_SECONDS } from '../../../auth/auth-config.ts';
import { ONE_SECOND_MS } from '../../../config/app.ts';
import { trackEvent } from '../../monitoring.ts';

export type AuthorizationCodeStatus = 'pending' | 'ready' | 'expired';

export type AuthorizationCodeRecord = {
  loginId: string;
  status: AuthorizationCodeStatus;
  codeChallenge: string;
  authorizationCode: string | null;
  maSessionCookieValue: string | null;
  createdAtMs: number;
  expiresAtMs: number;
};

const authorizationCodeStore = new Map<string, AuthorizationCodeRecord>();
const revokedSessionTokenStore = new Map<string, number>();

function isExpired(record: AuthorizationCodeRecord) {
  return Date.now() > record.expiresAtMs;
}

function pruneExpiredMemoryRecords() {
  let prunedCount = 0;

  for (const [loginId, record] of authorizationCodeStore.entries()) {
    if (!isExpired(record)) {
      continue;
    }

    authorizationCodeStore.delete(loginId);
    prunedCount += 1;
  }

  if (prunedCount > 0) {
    trackEvent('amsapp-auth-code-expired', {
      count: prunedCount,
      storage: 'memory',
    });
  }
}

function pruneExpiredRevokedSessionTokens() {
  const now = Date.now();

  for (const [token, expiresAtMs] of revokedSessionTokenStore.entries()) {
    if (now <= expiresAtMs) {
      continue;
    }

    revokedSessionTokenStore.delete(token);
  }
}

function getRecord(loginId: string) {
  const record = authorizationCodeStore.get(loginId) ?? null;
  if (!record) {
    return null;
  }

  if (isExpired(record)) {
    record.status = 'expired';
    record.authorizationCode = null;
  }

  return record;
}

export function createLoginAttempt(codeChallenge: string) {
  const loginId = randomUUID();
  const createdAtMs = Date.now();

  pruneExpiredMemoryRecords();
  pruneExpiredRevokedSessionTokens();

  authorizationCodeStore.set(loginId, {
    loginId,
    status: 'pending',
    codeChallenge,
    authorizationCode: null,
    maSessionCookieValue: null,
    createdAtMs,
    expiresAtMs: createdAtMs + AUTHORIZATION_CODE_TTL_MS,
  });

  trackEvent('amsapp-auth-code-created', {
    storage: 'memory',
    status: 'pending',
  });

  return loginId;
}

export function markLoginReady(loginId: string, maSessionCookieValue: string) {
  if (!maSessionCookieValue) {
    return null;
  }

  const record = getRecord(loginId);

  if (!record || record.status !== 'pending') {
    return null;
  }

  record.status = 'ready';
  record.authorizationCode = randomUUID();
  record.maSessionCookieValue = maSessionCookieValue;

  trackEvent('amsapp-auth-code-ready', {
    storage: 'memory',
    status: record.status,
  });

  return record;
}

export function getByAuthorizationCode(authorizationCode: string) {
  for (const record of authorizationCodeStore.values()) {
    if (record.authorizationCode !== authorizationCode) {
      continue;
    }

    if (isExpired(record)) {
      record.status = 'expired';
      record.authorizationCode = null;
      return null;
    }

    return record;
  }

  return null;
}

export function consumeByAuthorizationCode(authorizationCode: string) {
  const record = getByAuthorizationCode(authorizationCode);
  if (!record) {
    return null;
  }

  authorizationCodeStore.delete(record.loginId);
  trackEvent('amsapp-auth-exchange-success', {
    storage: 'memory',
  });
  return record;
}

export function getByLoginId(loginId: string) {
  return getRecord(loginId);
}

export function clearAmsAppAuthStore() {
  authorizationCodeStore.clear();
  revokedSessionTokenStore.clear();
}

export function revokeSessionToken(sessionToken: string) {
  if (!sessionToken) {
    return 0;
  }

  pruneExpiredMemoryRecords();
  pruneExpiredRevokedSessionTokens();

  let removedRecords = 0;

  for (const [loginId, record] of authorizationCodeStore.entries()) {
    if (record.maSessionCookieValue !== sessionToken) {
      continue;
    }

    authorizationCodeStore.delete(loginId);
    removedRecords += 1;
  }

  revokedSessionTokenStore.set(
    sessionToken,
    Date.now() + OIDC_SESSION_MAX_AGE_SECONDS * ONE_SECOND_MS
  );

  trackEvent('amsapp-auth-session-revoked', {
    storage: 'memory',
    removedRecords,
  });

  return removedRecords;
}

export function isSessionTokenRevoked(sessionToken: string) {
  if (!sessionToken) {
    return false;
  }

  pruneExpiredRevokedSessionTokens();
  return revokedSessionTokenStore.has(sessionToken);
}
