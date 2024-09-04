import express, { Response, Request } from 'express';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config';
import { generateDevSessionCookieValue } from '../auth/auth-helpers-development';
import { isBlacklistedHandler } from '../routing/route-handlers';
import {
  getIsBlackListed,
  addToBlackList,
  cleanupSessionIds,
} from './session-blacklist';

describe('Session-blacklist', () => {
  const sessionID = 'test123';

  test('Is NOT blacklisted', async () => {
    const rs = await getIsBlackListed(sessionID);

    expect(rs).toBe(false);
  });

  test('Add to black list', async () => {
    await addToBlackList(sessionID);
  });

  test('Is blacklisted', async () => {
    const rs = await getIsBlackListed(sessionID);
    expect(rs).toBe(true);
  });

  test('Clean up session ids', async () => {
    await cleanupSessionIds(-1);
    const rs = await getIsBlackListed(sessionID);
    expect(rs).toBe(false);
  });
});
