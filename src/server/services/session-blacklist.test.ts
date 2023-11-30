import express, { Response, Request } from 'express';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
} from '../config';
import { generateDevSessionCookieValue } from '../helpers/app.development';
import {
  addToBlackList,
  isBlacklisted,
  cleanupSessionIds,
  isBlacklistedHandler,
} from './session-blacklist';
import { CompactEncrypt, DecryptOptions, compactDecrypt } from 'jose';
import {
  createCookieEncriptionKey,
  decryptCookieValue,
  encryptCookieValue,
  encryptionKey,
} from '../helpers/app';

// Uses SQLITE :memory:  database
describe('Session-blacklist', () => {
  const sessionID = 'test123';

  test('Is NOT blacklisted', async () => {
    const rs = await isBlacklisted(sessionID);

    expect(rs).toBe(false);
  });

  test('Add to black list', async () => {
    await addToBlackList(sessionID);
  });

  test('Is blacklisted', async () => {
    const rs = await isBlacklisted(sessionID);
    expect(rs).toBe(true);
  });

  test('Clean up session ids', async () => {
    await cleanupSessionIds(-1);
    const rs = await isBlacklisted(sessionID);
    expect(rs).toBe(false);
  });

  test('isBlacklistedHandler', async () => {
    const cookieValue = await generateDevSessionCookieValue(
      'digid',
      '000-digid-999',
      sessionID
    );
    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: cookieValue,
      },
    } as unknown as Request;

    const next = vi.fn();
    const res = { send: vi.fn(), status: vi.fn() } as unknown as Response;
    const rs = await isBlacklistedHandler(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    await addToBlackList(sessionID);
    const rs2 = await isBlacklistedHandler(req, res, next);

    expect(res.send).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
