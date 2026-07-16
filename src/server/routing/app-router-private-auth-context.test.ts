import type { Request } from 'express';

import {
  AMSAPP_SESSION_TOKEN_HEADER,
  privateNetworkAuthContextMiddleware,
} from './app-router-private-auth-context.ts';
import { RequestMock, ResponseMock } from '../../testing/utils.ts';
import { OIDC_SESSION_COOKIE_NAME } from '../auth/auth-config.ts';
import { getAuth } from '../auth/auth-helpers.ts';
import type { AuthProfile } from '../auth/auth-types.ts';

const DIGID_PROFILE: AuthProfile = {
  sid: 'e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  profileType: 'private',
  authMethod: 'digid',
  id: 'x1',
};

describe('app-router-private-auth-context', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('uses x-amsapp-session-token as __MA-appSession cookie', async () => {
    const sessionToken = Buffer.from(JSON.stringify(DIGID_PROFILE)).toString(
      'base64'
    );

    const req = RequestMock.new().get() as Request;
    (req as Request & { headers: Record<string, string> }).headers = {
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    };
    (req as Request & { path: string; url: string }).path =
      '/services/amsapp/auth/services/all';
    (req as Request & { path: string; url: string }).url =
      '/services/amsapp/auth/services/all';

    const resMock = ResponseMock.new();
    const next = vi.fn();

    await privateNetworkAuthContextMiddleware(req, resMock, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.cookies?.[OIDC_SESSION_COOKIE_NAME]).toBe(sessionToken);
    expect(getAuth(req)?.profile.id).toBe(DIGID_PROFILE.id);
  });

  test('ignores bearer token and does not create session cookie', async () => {
    const sessionToken = Buffer.from(JSON.stringify(DIGID_PROFILE)).toString(
      'base64'
    );

    const req = RequestMock.new().get() as Request;
    (req as Request & { headers: Record<string, string> }).headers = {
      authorization: `Bearer ${sessionToken}`,
    };
    (req as Request & { path: string; url: string }).path =
      '/services/amsapp/auth/services/all';
    (req as Request & { path: string; url: string }).url =
      '/services/amsapp/auth/services/all';

    const resMock = ResponseMock.new();
    const next = vi.fn();

    await privateNetworkAuthContextMiddleware(req, resMock, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.cookies?.[OIDC_SESSION_COOKIE_NAME]).toBeUndefined();
    expect(getAuth(req)).toBeNull();
  });
});
