import { promisify } from 'node:util';

import type { Request } from 'express';
import MockDate from 'mockdate';

import { authRouterDevelopment } from './app-router-development.ts';
import {
  AMSAPP_SESSION_TOKEN_HEADER,
  privateNetworkAuthContextMiddleware,
} from './app-router-private-auth-context.ts';
import { createDevelopmentSession } from './route-helpers-oidc.ts';
import { RequestMock, ResponseMock } from '../../testing/utils.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  OIDC_SESSION_ABSOLUTE_MAX_AGE_SECONDS,
  oidcSessionStore,
} from '../auth/auth-config.ts';
import { getAuth } from '../auth/auth-helpers.ts';
import { authRoutes } from '../auth/auth-routes.ts';
import type { AuthProfile } from '../auth/auth-types.ts';
import { ONE_MINUTE_MS, ONE_SECOND_MS } from '../config/app.ts';

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
    get: vi.fn((name: string) => headers[name.toLowerCase()]),
  });
  return req;
}

describe('app-router-private-auth-context', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    await promisify(oidcSessionStore.destroy.bind(oidcSessionStore))(
      Buffer.from(JSON.stringify(DIGID_PROFILE)).toString('base64')
    );
  });

  afterEach(() => MockDate.reset());

  it('uses x-amsapp-session-token as __MA-appSession cookie', async () => {
    const sessionToken = await createDevelopmentSession(
      RequestMock.new().get(),
      DIGID_PROFILE
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

  it('ignores bearer token and does not create session cookie', async () => {
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

  it('does not authenticate an unregistered development profile token', async () => {
    const sessionToken = Buffer.from(
      JSON.stringify({ ...DIGID_PROFILE, sid: 'unregistered' })
    ).toString('base64');
    const req = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });
    const next = vi.fn();

    await privateNetworkAuthContextMiddleware(req, ResponseMock.new(), next);

    expect(next).toHaveBeenCalledWith();
    expect(getAuth(req)).toBeNull();
  });

  it('does not authenticate a deleted session', async () => {
    const sessionToken = await createDevelopmentSession(
      RequestMock.new().get(),
      DIGID_PROFILE
    );

    await promisify(oidcSessionStore.destroy.bind(oidcSessionStore))(
      sessionToken
    );

    const req = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });

    const resMock = ResponseMock.new();
    const next = vi.fn();

    await privateNetworkAuthContextMiddleware(req, resMock, next);

    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
    expect(getAuth(req)).toBeNull();
  });

  it('invalidates the app credential when the local browser logs out', async () => {
    const sessionToken = await createDevelopmentSession(
      RequestMock.new().get(),
      DIGID_PROFILE
    );
    const req = createPrivateAuthRequest({});
    Object.assign(req, {
      method: 'GET',
      url: authRoutes.AUTH_LOGOUT,
      cookies: { [OIDC_SESSION_COOKIE_NAME]: sessionToken },
    });
    const res = ResponseMock.new();
    await new Promise<void>((resolve, reject) => {
      res.redirect.mockImplementation(() => {
        resolve();
        return res;
      });
      authRouterDevelopment(req, res, (error?: unknown) =>
        reject(error ?? new Error('Logout route not handled'))
      );
    });
    expect(
      await promisify(oidcSessionStore.get.bind(oidcSessionStore))(sessionToken)
    ).toBeFalsy();

    const replay = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });
    const next = vi.fn();
    await privateNetworkAuthContextMiddleware(replay, ResponseMock.new(), next);
    expect(next).toHaveBeenCalledWith();
    expect(getAuth(replay)).toBeNull();
  });

  it('does not authenticate an expired session', async () => {
    const sessionToken = await createDevelopmentSession(
      RequestMock.new().get(),
      DIGID_PROFILE
    );
    MockDate.set(Date.now() + OIDC_SESSION_MAX_AGE_SECONDS * 1000);
    const req = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });
    const next = vi.fn();

    await privateNetworkAuthContextMiddleware(req, ResponseMock.new(), next);

    expect(next).toHaveBeenCalledWith();
    expect(getAuth(req)).toBeNull();
  });

  it('renews active sessions without exceeding the absolute lifetime', async () => {
    MockDate.set('2026-01-01T12:00:00Z');
    const sessionToken = await createDevelopmentSession(
      RequestMock.new().get(),
      DIGID_PROFILE
    );
    const readSession = promisify(oidcSessionStore.get.bind(oidcSessionStore));
    const initial = await readSession(sessionToken);

    MockDate.set(Date.now() + 14 * ONE_MINUTE_MS);
    const req = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });
    const next = vi.fn();
    await privateNetworkAuthContextMiddleware(req, ResponseMock.new(), next);
    expect(next).toHaveBeenCalledWith();
    expect(getAuth(req)?.profile.id).toBe(DIGID_PROFILE.id);
    const renewed = await readSession(sessionToken);
    expect(renewed!.header.iat).toBe(initial!.header.iat);
    expect(renewed!.header.exp).toBe(initial!.header.exp + 14 * 60);

    renewed!.header.iat =
      Math.floor(Date.now() / ONE_SECOND_MS) -
      OIDC_SESSION_ABSOLUTE_MAX_AGE_SECONDS +
      60;
    await promisify(oidcSessionStore.set.bind(oidcSessionStore))(
      sessionToken,
      renewed!
    );
    const lastRequest = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });
    await privateNetworkAuthContextMiddleware(
      lastRequest,
      ResponseMock.new(),
      next
    );
    const capped = await readSession(sessionToken);
    expect(capped!.header.exp).toBe(
      Math.floor(Date.now() / ONE_SECOND_MS) + 60
    );

    MockDate.set(Date.now() + 60 * ONE_SECOND_MS);
    const expiredRequest = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });
    await privateNetworkAuthContextMiddleware(
      expiredRequest,
      ResponseMock.new(),
      next
    );
    expect(getAuth(expiredRequest)).toBeNull();
  });

  it('preserves browser login and ignores app headers when the feature is off', async () => {
    vi.resetModules();
    vi.doMock('../services/amsapp/auth/amsapp-auth-service-config.ts', () => ({
      featureToggle: { amsAppUniversalAuthIsActive: false },
    }));
    try {
      const { ensureOIDCAuthContextStub } =
        await import('./route-helpers-oidc.ts');
      const { privateNetworkAuthContextMiddleware: middleware } =
        await import('./app-router-private-auth-context.ts');
      const sessionToken = Buffer.from(JSON.stringify(DIGID_PROFILE)).toString(
        'base64'
      );
      const browserReq = RequestMock.new()
        .setCookies({
          [OIDC_SESSION_COOKIE_NAME]: sessionToken,
        })
        .get();
      await ensureOIDCAuthContextStub(browserReq);
      expect(getAuth(browserReq)?.profile.id).toBe(DIGID_PROFILE.id);

      const appReq = createPrivateAuthRequest({
        [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
      });
      const next = vi.fn();
      await middleware(appReq, ResponseMock.new(), next);
      expect(next).toHaveBeenCalledWith();
      expect(appReq.cookies?.[OIDC_SESSION_COOKIE_NAME]).toBeUndefined();
      expect(getAuth(appReq)).toBeNull();
    } finally {
      vi.doUnmock('../services/amsapp/auth/amsapp-auth-service-config.ts');
      vi.resetModules();
    }
  });
});
