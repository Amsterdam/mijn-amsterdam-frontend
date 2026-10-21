import { randomUUID } from 'node:crypto';

import { AUTHORIZATION_CODE_TTL_MS } from './amsapp-auth-service-config.ts'
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

export function markLoginReady(
  loginId: string,
  maSessionCookieValue: string
) {
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
}
