import { randomUUID } from 'node:crypto';

import { AUTHORIZATION_CODE_TTL_MS } from './amsapp-auth-service-config.ts';

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

  authorizationCodeStore.set(loginId, {
    loginId,
    status: 'pending',
    codeChallenge,
    authorizationCode: null,
    maSessionCookieValue: null,
    createdAtMs,
    expiresAtMs: createdAtMs + AUTHORIZATION_CODE_TTL_MS,
  });

  return loginId;
}

export function markLoginReady(loginId: string, maSessionCookieValue: string) {
  const record = getRecord(loginId);

  if (!record || record.status !== 'pending' || !maSessionCookieValue) {
    return null;
  }

  record.status = 'ready';
  record.authorizationCode = randomUUID();
  record.maSessionCookieValue = maSessionCookieValue;

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
  return record;
}

export function getByLoginId(loginId: string) {
  return getRecord(loginId);
}

export function clearAmsAppAuthStore() {
  authorizationCodeStore.clear();
}
