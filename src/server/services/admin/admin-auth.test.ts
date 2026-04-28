import type { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { handleLogin, handleCallback, handleLogout } from './admin-auth.ts';
import { OAUTH_ROLE_APPLICATION_ADMIN } from './admin-service-config.ts';
import type { RequestWithSession } from './admin-types.ts';
import { RequestMock, ResponseMock } from '../../../testing/utils.ts';
import { apiErrorResult } from '../../../universal/helpers/api.ts';
import { BFF_BASE_PATH_ADMIN } from '../../routing/bff-routes.ts';
import { sendResponseHTML } from '../../routing/route-helpers.ts';

vi.mock('./admin-service-config.ts', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    BFF_ADMIN_AUTH_REDIRECT_URI: '/oauth/redirect',
    BFF_ADMIN_AUTH_POST_LOGOUT_REDIRECT_URI: '/oauth/logout/redirect',
  };
});

const mocks = vi.hoisted(() => {
  const getAuthCodeUrl = vi.fn(async ({ redirectUri }) => redirectUri);
  const acquireTokenByCode = vi.fn();
  return { getAuthCodeUrl, acquireTokenByCode };
});

// Mock msal and expose helpers to control behavior from tests
vi.mock('@azure/msal-node', () => {
  class CryptoProvider {
    base64Encode(input: string) {
      return Buffer.from(input).toString('base64');
    }
  }

  class ConfidentialClientApplication {
    getAuthCodeUrl = mocks.getAuthCodeUrl;
    acquireTokenByCode = mocks.acquireTokenByCode;
    constructor() {}
  }

  return {
    CryptoProvider,
    ConfidentialClientApplication,
  };
});

vi.mock('../../routing/route-helpers.ts', async (importOrgininal) => ({
  ...(await importOrgininal()),
  sendResponseHTML: vi.fn(),
  sendUnauthorized: vi.fn(),
}));

vi.mock('../monitoring.ts', () => ({ captureException: vi.fn() }));

beforeEach(() => {
  vi.resetAllMocks();
});

function base64EncodeJson(obj: unknown) {
  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

describe('admin-auth handlers', () => {
  it('handleLogin redirects to auth url', async () => {
    const req = RequestMock.new();
    req.query = { originalUrl: `${BFF_BASE_PATH_ADMIN}/some/orig` };

    const res = ResponseMock.new();

    await handleLogin(req.get(), res);

    expect(mocks.getAuthCodeUrl).toHaveBeenCalledWith({
      redirectUri: '/oauth/redirect',
      responseMode: 'form_post',
      scopes: ['User.read'],
      state: 'eyJvcmlnaW5hbFVybCI6Ii9hcGkvdjEvYWRtaW4vc29tZS9vcmlnIn0=',
    });

    expect(res.redirect).toHaveBeenCalledWith('/oauth/redirect');
  });

  it('handleCallback authorizes and redirects when role present', async () => {
    const mockAuth = {
      account: {
        idTokenClaims: { roles: [OAUTH_ROLE_APPLICATION_ADMIN] },
        username: 'bob',
      },
    };
    mocks.acquireTokenByCode.mockResolvedValue(mockAuth);

    const state = base64EncodeJson({ originalUrl: '/api/v1/admin/xyz' });
    const reqBase = RequestMock.new();
    reqBase.body = { code: 'c', state };
    const req = reqBase.get() as RequestWithSession;
    req.session = {} as RequestWithSession['session'];

    const res = ResponseMock.new();

    await handleCallback(req, res);

    expect(mocks.acquireTokenByCode).toHaveBeenCalledWith(
      {
        code: 'c',
        redirectUri: '/oauth/redirect',
        scopes: ['User.read'],
      },
      {
        code: 'c',
        state: 'eyJvcmlnaW5hbFVybCI6Ii9hcGkvdjEvYWRtaW4veHl6In0=',
      }
    );

    expect(req.session.isAuthenticated).toBe(true);
    expect(req.session.username).toBe('bob');
    expect(res.redirect).toHaveBeenCalledWith('/api/v1/admin/xyz');
  });

  it('handleCallback denies access when role missing', async () => {
    const mockAuth = { account: { idTokenClaims: { roles: [] } } };
    mocks.acquireTokenByCode.mockResolvedValue(mockAuth);

    const state = base64EncodeJson({ originalUrl: '/api/v1/admin/xyz' });

    const reqBase = RequestMock.new();
    reqBase.body = { code: 'c', state };
    const req = reqBase.get() as RequestWithSession;
    req.session = {} as RequestWithSession['session'];

    const res = ResponseMock.new();

    await handleCallback(req, res);

    expect(sendResponseHTML).toHaveBeenCalledWith(
      res,
      apiErrorResult('User access denied: missing required role', null, 403)
    );
  });

  it('handleCallback reports error when acquireTokenByCode does not respond with a valid token', async () => {
    mocks.acquireTokenByCode.mockResolvedValue(null);

    const reqBase = RequestMock.new();
    reqBase.body = { code: 'c', state: '' };
    const req = reqBase.get() as RequestWithSession;
    req.session = {} as RequestWithSession['session'];

    const res = ResponseMock.new();

    await handleCallback(req, res);

    expect(sendResponseHTML).toHaveBeenCalledWith(
      res,
      apiErrorResult(
        'Error handling authentication callback: Error: Could not acquire token by code',
        null,
        500
      )
    );
  });

  it('handleCallback reports error when acquireTokenByCode throws', async () => {
    mocks.acquireTokenByCode.mockRejectedValue(new Error('boom'));

    const reqBase = RequestMock.new();
    reqBase.body = { code: 'c', state: '' };
    const req = reqBase.get() as RequestWithSession;
    req.session = {} as RequestWithSession['session'];

    const res = ResponseMock.new();

    await handleCallback(req, res);

    expect(sendResponseHTML).toHaveBeenCalledWith(
      res,
      apiErrorResult(
        'Error handling authentication callback: Error: boom',
        null,
        500
      )
    );
  });

  it('handleLogout destroys session and redirects', () => {
    const req = RequestMock.new().get();
    // attach a session destroy that calls callback
    req.session = {
      destroy: vi.fn((cb: () => void) => cb()),
    } as unknown as Request['session'];

    const res = ResponseMock.new();

    handleLogout(req, res);

    expect(req.session.destroy).toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith('/oauth/logout/redirect');
  });
});
