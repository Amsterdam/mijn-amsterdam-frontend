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

type PrivateAuthRequest = Request & {
  headers: Record<string, string>;
  path: string;
  url: string;
};

function createPrivateAuthRequest(headers: Record<string, string>) {
  const req = RequestMock.new().get() as PrivateAuthRequest;
  Object.assign(req, {
    headers,
    path: '/services/amsapp/auth/services/all',
    url: '/services/amsapp/auth/services/all',
  });
  return req;
}

describe('app-router-private-auth-context', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('uses x-amsapp-session-token as __MA-appSession cookie', async () => {
    const sessionToken = Buffer.from(JSON.stringify(DIGID_PROFILE)).toString(
      'base64'
    );

    const req = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });

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

    const req = createPrivateAuthRequest({
      authorization: `Bearer ${sessionToken}`,
    });

    const resMock = ResponseMock.new();
    const next = vi.fn();

    await privateNetworkAuthContextMiddleware(req, resMock, next);

    expect(next).toHaveBeenCalledOnce();
    expect(req.cookies?.[OIDC_SESSION_COOKIE_NAME]).toBeUndefined();
    expect(getAuth(req)).toBeNull();
  });
});
