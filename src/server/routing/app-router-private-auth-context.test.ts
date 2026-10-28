import { promisify } from 'node:util';

import type { Request } from 'express';
import MockDate from 'mockdate';

import { authRouterDevelopment } from './app-router-development.ts';
import {
  AMSAPP_SESSION_TOKEN_HEADER,
  privateNetworkAuthContextMiddleware,
} from './app-router-private-auth-context.ts';
import {
  createDevelopmentSessionMock,
  createOidcResponseMock,
  getOidcSessionMock,
  RequestMock,
  ResponseMock,
} from '../../testing/utils.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  OIDC_SESSION_ABSOLUTE_MAX_AGE_SECONDS,
  oidcSessionStore,
} from '../auth/auth-config.ts';
import { getAuth } from '../auth/auth-helpers.ts';
import { authRoutes } from '../auth/auth-routes.ts';
import type { AuthProfile } from '../auth/auth-types.ts';
import { ONE_MINUTE_SECONDS, ONE_SECOND_MS } from '../config/app.ts';

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
  beforeEach(() => {
    vi.resetAllMocks();
    MockDate.set('2026-01-01T12:00:00Z');
  });

  afterEach(() => MockDate.reset());

  it('uses x-amsapp-session-token as __MA-appSession cookie', async () => {
    const sessionToken = await createDevelopmentSessionMock(DIGID_PROFILE);

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
    const sessionToken = await createDevelopmentSessionMock(DIGID_PROFILE);

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
    const sessionToken = await createDevelopmentSessionMock(DIGID_PROFILE);
    const { req, res } = await getOidcSessionMock(sessionToken);
    Object.assign(req, {
      method: 'GET',
      url: authRoutes.AUTH_LOGOUT,
    });
    await new Promise<void>((resolve, reject) => {
      res.redirect.mockImplementation(() => {
        resolve();
        return res;
      });
      authRouterDevelopment(req, res, (error?: unknown) =>
        reject(error ?? new Error('Logout route not handled'))
      );
    });
    await res.end();
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
    const sessionToken = await createDevelopmentSessionMock(DIGID_PROFILE);
    MockDate.set(Date.now() + OIDC_SESSION_MAX_AGE_SECONDS * ONE_SECOND_MS);
    const req = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });
    const next = vi.fn();

    await privateNetworkAuthContextMiddleware(req, ResponseMock.new(), next);

    expect(next).toHaveBeenCalledWith();
    expect(getAuth(req)).toBeNull();
  });

  it('renews active sessions without exceeding the absolute lifetime', async () => {
    const sessionToken = await createDevelopmentSessionMock(DIGID_PROFILE);
    const readSession = promisify(oidcSessionStore.get.bind(oidcSessionStore));
    const initial = await readSession(sessionToken);

    const ONE_MINUTE_BEFORE_EXPIRY_SECONDS =
      OIDC_SESSION_MAX_AGE_SECONDS - ONE_MINUTE_SECONDS;
    MockDate.set(
      Date.now() + ONE_MINUTE_BEFORE_EXPIRY_SECONDS * ONE_SECOND_MS
    );
    const req = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });
    const next = vi.fn();
    const res = createOidcResponseMock();
    await privateNetworkAuthContextMiddleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
    expect(getAuth(req)?.profile.id).toBe(DIGID_PROFILE.id);
    await res.end();
    const renewed = await readSession(sessionToken);
    expect(renewed!.header.iat).toBe(initial!.header.iat);
    expect(renewed!.header.exp).toBe(
      initial!.header.exp + ONE_MINUTE_BEFORE_EXPIRY_SECONDS
    );

    renewed!.header.iat =
      Math.floor(Date.now() / ONE_SECOND_MS) -
      OIDC_SESSION_ABSOLUTE_MAX_AGE_SECONDS +
      ONE_MINUTE_SECONDS;
    await promisify(oidcSessionStore.set.bind(oidcSessionStore))(
      sessionToken,
      renewed!
    );
    const lastRequest = createPrivateAuthRequest({
      [AMSAPP_SESSION_TOKEN_HEADER]: sessionToken,
    });
    const lastResponse = createOidcResponseMock();
    await privateNetworkAuthContextMiddleware(lastRequest, lastResponse, next);
    await lastResponse.end();
    const capped = await readSession(sessionToken);
    expect(capped!.header.exp).toBe(
      Math.floor(Date.now() / ONE_SECOND_MS) + ONE_MINUTE_SECONDS
    );

    MockDate.set(Date.now() + ONE_MINUTE_SECONDS * ONE_SECOND_MS);
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
      const { privateNetworkAuthContextMiddleware: middleware } =
        await import('./app-router-private-auth-context.ts');
      const sessionToken = await createDevelopmentSessionMock(DIGID_PROFILE);
      const { req: browserReq, res: browserRes } =
        await getOidcSessionMock(sessionToken);
      expect(getAuth(browserReq)?.profile.id).toBe(DIGID_PROFILE.id);
      await browserRes.end();

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
