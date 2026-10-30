import { createHash } from 'node:crypto';
import { promisify } from 'node:util';

import type { Request } from 'express';
import MockDate from 'mockdate';

import {
  handleAmsAppAuthCallback,
  handleAmsAppAuthLoginStart,
  handleAmsAppAuthLogout,
  handleAmsAppAuthTokenExchange,
} from './amsapp-auth-route-handlers.ts';
import { amsappAuthRouter } from './amsapp-auth-router.ts';
import { apiResponseErrors, routes } from './amsapp-auth-service-config.ts';
import {
  clearAmsAppAuthStore,
  createLoginAttempt,
  getByLoginId,
  markLoginReady,
} from './amsapp-auth-store.ts';
import {
  createDevelopmentSessionMock,
  createOidcResponseMock,
  getOidcSessionMock,
  RequestMock,
  ResponseMock,
} from '../../../../testing/utils.ts';
import { RETURNTO_AMSAPP_AUTH_CALLBACK } from '../../../auth/auth-after-redirect-returnto.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
  oidcConfigDigid,
  oidcSessionStore,
  openIdAuth,
} from '../../../auth/auth-config.ts';
import { getAuth } from '../../../auth/auth-helpers.ts';
import type { AuthProfile } from '../../../auth/auth-types.ts';
import { ONE_MINUTE_MS, ONE_SECOND_MS } from '../../../config/app.ts';
import * as envHelpers from '../../../helpers/env.ts';
import { privateNetworkAuthContextMiddleware } from '../../../routing/app-router-private-auth-context.ts';
import { createDevelopmentSessionData } from '../../../routing/route-helpers-oidc.ts';
import * as serviceController from '../../controller.ts';

const DIGID_PROFILE: AuthProfile = {
  sid: 'e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  profileType: 'private',
  authMethod: 'digid',
  id: 'x1',
};

describe('amsapp-auth-route-handlers', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    await clearAmsAppAuthStore();
  });

  afterEach(() => MockDate.reset());

  describe('private services-all authentication', () => {
    afterEach(() => vi.restoreAllMocks());

    test.each(['missing', 'unrestored', 'authenticated'])(
      'requires an authenticated user session: %s',
      async (sessionState) => {
        const apiKey = 'services-all-test-api-key';
        vi.spyOn(envHelpers, 'getFromEnv').mockReturnValue(apiKey);
        const loadServices = vi
          .spyOn(serviceController, 'loadServicesAll')
          .mockResolvedValue({});
        const reqMock = RequestMock.new().setUrl(
          routes.private.AMSAPP_AUTH_SERVICES_ALL
        );
        if (sessionState !== 'missing') {
          reqMock.setCookies({
            [OIDC_SESSION_COOKIE_NAME]: 'session-token',
          });
        }
        if (sessionState === 'authenticated') {
          await reqMock.createOIDCStub(DIGID_PROFILE);
        }
        const req = reqMock.get();
        Object.assign(req, {
          method: 'GET',
          headers: { 'x-api-key': apiKey },
        });
        const res = Object.assign(ResponseMock.new(), { json: vi.fn() });
        await new Promise<void>((resolve, reject) => {
          res.send.mockImplementation(() => {
            resolve();
            return res;
          });
          res.json.mockImplementation(() => {
            resolve();
            return res;
          });
          amsappAuthRouter.private(req, res, (error?: unknown) =>
            error ? reject(error) : resolve()
          );
        });

        if (sessionState === 'authenticated') {
          expect(loadServices).toHaveBeenCalledWith(req, res);
          expect(res.json).toHaveBeenCalledWith({});
          expect(res.statusCode).toBe(200);
        } else {
          expect(res.status).toHaveBeenCalledWith(401);
          expect(loadServices).not.toHaveBeenCalled();
          expect(res.json).not.toHaveBeenCalled();
        }
      }
    );
  });

  test('login-start stores codeChallenge and redirects to DigiD login', async () => {
    const reqMock = RequestMock.new().setQuery({
      codeChallenge: 'test-code-challenge',
    });
    const req = reqMock.get();
    const resMock = ResponseMock.new();

    await handleAmsAppAuthLoginStart(req, resMock);

    expect(resMock.redirect).toHaveBeenCalledOnce();

    const redirectUrl = new URL(resMock.redirect.mock.calls[0][0]);
    expect(redirectUrl.pathname).toBe('/api/v1/auth/digid/login');
    expect(redirectUrl.searchParams.get('returnTo')).toBe(
      RETURNTO_AMSAPP_AUTH_CALLBACK
    );

    const loginId = redirectUrl.searchParams.get('amsapp-login-id');
    expect(loginId).toBeTruthy();

    const storedLoginAttempt = await getByLoginId(loginId!);
    expect(storedLoginAttempt?.codeChallenge).toBe('test-code-challenge');
    expect(storedLoginAttempt?.status).toBe('pending');
  });

  test('login-start returns explicit invalid-input contract when query is missing', async () => {
    const req = RequestMock.new().setQuery({}).get();
    const resMock = ResponseMock.new();

    await handleAmsAppAuthLoginStart(req, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        code: 400,
        message: expect.stringContaining(
          apiResponseErrors.INVALID_INPUT.message
        ),
      })
    );
  });

  test('login-start intentionally rejects snake_case query contract', async () => {
    const req = RequestMock.new()
      .setQuery({
        code_challenge: 'snake-case-not-supported',
      })
      .get();
    const resMock = ResponseMock.new();

    await handleAmsAppAuthLoginStart(req, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        message: expect.stringContaining(
          apiResponseErrors.INVALID_INPUT.message
        ),
      })
    );
  });

  test('callback marks authorizationCode ready and returns deeplink', async () => {
    const loginId = await createLoginAttempt('code-challenge-123');
    const reqMock = RequestMock.new()
      .setParams({ loginId })
      .setCookies({
        [OIDC_SESSION_COOKIE_NAME]: 'ma-session-cookie-value',
      });
    await reqMock.createOIDCStub(DIGID_PROFILE);

    const req = reqMock.get<{ loginId: string }>();
    const resMock = ResponseMock.new();

    await handleAmsAppAuthCallback(req, resMock);

    expect(resMock.render).toHaveBeenCalledOnce();
    const renderProps = resMock.render.mock.calls[0][1];

    const appHref = new URL(renderProps.appHref);
    expect(`${appHref.protocol}//${appHref.host}${appHref.pathname}`).toBe(
      'amsterdam://mijn-amsterdam/gelukt'
    );

    const authorizationCode = appHref.searchParams.get('authorizationCode');
    expect(authorizationCode).toBeTruthy();

    const storedLoginAttempt = await getByLoginId(loginId);
    expect(storedLoginAttempt?.status).toBe('ready');
    expect(storedLoginAttempt?.authorizationCode).toBe(authorizationCode);
    expect(storedLoginAttempt?.maSessionCookieValue).toBe(
      'ma-session-cookie-value'
    );
  });

  test('callback renders explicit auth failure when user is not authenticated', async () => {
    const loginId = await createLoginAttempt('code-challenge-123');
    const req = RequestMock.new()
      .setParams({ loginId })
      .get<{ loginId: string }>();
    const resMock = ResponseMock.new();

    await handleAmsAppAuthCallback(req, resMock);

    expect(resMock.render).toHaveBeenCalledOnce();
    const renderProps = resMock.render.mock.calls[0][1];
    expect(renderProps.error).toMatchObject({
      code: '001',
      message: expect.stringContaining(apiResponseErrors.DIGID_AUTH.message),
    });
  });

  test('callback renders explicit missing-login error when loginId is unknown', async () => {
    const reqMock = RequestMock.new()
      .setParams({ loginId: 'missing-login-id' })
      .setCookies({
        [OIDC_SESSION_COOKIE_NAME]: 'ma-session-cookie-value',
      });
    await reqMock.createOIDCStub(DIGID_PROFILE);

    const req = reqMock.get<{ loginId: string }>();
    const resMock = ResponseMock.new();

    await handleAmsAppAuthCallback(req, resMock);

    expect(resMock.render).toHaveBeenCalledOnce();
    const renderProps = resMock.render.mock.calls[0][1];
    expect(renderProps.error).toMatchObject({
      code: '002',
      message: expect.stringContaining(
        apiResponseErrors.LOGIN_NOT_FOUND_OR_EXPIRED.message
      ),
    });
  });

  test('token exchange validates PKCE and returns MA session cookie value', async () => {
    const startedAt = Date.parse('2026-01-01T12:00:00Z');
    MockDate.set(startedAt);
    const sessionToken = await createDevelopmentSessionMock(DIGID_PROFILE);
    const codeVerifier = 'test';
    const codeChallenge = 'n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg'; // createHash('sha256').update(codeVerifier).digest('base64url');

    const loginId = await createLoginAttempt(codeChallenge);
    const readyRecord = await markLoginReady(loginId, sessionToken);

    const req = {
      body: {
        authorizationCode: readyRecord?.authorizationCode,
        codeVerifier,
      },
    } as Request;
    const resMock = ResponseMock.new();

    await handleAmsAppAuthTokenExchange(req, resMock);

    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'OK',
        content: expect.objectContaining({
          session: expect.objectContaining({
            name: OIDC_SESSION_COOKIE_NAME,
            value: sessionToken,
            expiresAt: expect.any(Number),
          }),
        }),
      })
    );

    expect(await getByLoginId(loginId)).toBeNull();
  });

  test.each(['missing', 'expired'])(
    'token exchange rejects a %s backing session',
    async (sessionState) => {
      const startedAt = Date.parse('2026-01-01T12:00:00Z');
      MockDate.set(startedAt);
      const sessionToken =
        sessionState === 'expired'
          ? await createDevelopmentSessionMock(DIGID_PROFILE)
          : 'missing-session-token';
      MockDate.set(startedAt + OIDC_SESSION_MAX_AGE_SECONDS * ONE_SECOND_MS);
      const codeVerifier = 'mobile-app-code-verifier';
      const codeChallenge = createHash('sha256')
        .update(codeVerifier)
        .digest('base64url');
      const loginId = await createLoginAttempt(codeChallenge);
      const readyRecord = await markLoginReady(loginId, sessionToken);
      const req = {
        body: {
          authorizationCode: readyRecord?.authorizationCode,
          codeVerifier,
        },
      } as Request;
      const resMock = ResponseMock.new();

      await handleAmsAppAuthTokenExchange(req, resMock);

      expect(resMock.status).toHaveBeenCalledWith(400);
      expect(resMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ERROR',
          message: expect.stringContaining(
            apiResponseErrors.AUTHORIZATION_CODE_NOT_FOUND_OR_EXPIRED.message
          ),
        })
      );
    }
  );

  test('token exchange fails for PKCE mismatch', async () => {
    const codeVerifier = 'mobile-app-code-verifier';
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const loginId = await createLoginAttempt(codeChallenge);
    const readyRecord = await markLoginReady(
      loginId,
      'ma-session-cookie-value'
    );

    const req = {
      body: {
        authorizationCode: readyRecord?.authorizationCode,
        codeVerifier: `${codeVerifier}-mismatch`,
      },
    } as Request;

    const resMock = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(req, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        message: expect.stringContaining(
          apiResponseErrors.PKCE_MISMATCH.message
        ),
        code: 400,
      })
    );
    expect((await getByLoginId(loginId))?.status).toBe('ready');
  });

  test('token exchange returns explicit ApiError 005 contract for PKCE mismatch', async () => {
    const loginId = await createLoginAttempt('expected-code-challenge');
    const readyRecord = await markLoginReady(
      loginId,
      'ma-session-cookie-value'
    );

    const req = {
      body: {
        authorizationCode: readyRecord?.authorizationCode,
        codeVerifier: 'different-code-verifier',
      },
    } as Request;

    const resMock = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(req, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        code: 400,
        message: expect.stringContaining(
          apiResponseErrors.PKCE_MISMATCH.message
        ),
      })
    );
  });

  test('token exchange is one-time use', async () => {
    const codeVerifier = 'mobile-app-code-verifier';
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const loginId = await createLoginAttempt(codeChallenge);
    const readyRecord = await markLoginReady(
      loginId,
      'ma-session-cookie-value'
    );
    const authorizationCode = readyRecord?.authorizationCode;

    const firstReq = {
      body: {
        authorizationCode,
        codeVerifier,
      },
    } as Request;

    const firstRes = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(firstReq, firstRes);

    const secondReq = {
      body: {
        authorizationCode,
        codeVerifier,
      },
    } as Request;

    const secondRes = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(secondReq, secondRes);

    expect(secondRes.status).toHaveBeenCalledWith(400);
    expect(secondRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        message: expect.stringContaining(
          apiResponseErrors.AUTHORIZATION_CODE_NOT_FOUND_OR_EXPIRED.message
        ),
        code: 400,
      })
    );
  });

  test('token exchange fails with explicit error for unknown authorizationCode', async () => {
    const req = {
      body: {
        authorizationCode: 'missing-code',
        codeVerifier: 'mobile-app-code-verifier',
      },
    } as Request;

    const resMock = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(req, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        message: expect.stringContaining(
          apiResponseErrors.AUTHORIZATION_CODE_NOT_FOUND_OR_EXPIRED.message
        ),
        code: 400,
      })
    );
  });

  test('token exchange intentionally rejects snake_case body contract', async () => {
    const req = {
      body: {
        authorization_code: 'snake-case-not-supported',
        code_verifier: 'snake-case-not-supported',
      },
    } as Request;

    const resMock = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(req, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        message: expect.stringContaining(
          apiResponseErrors.INVALID_INPUT.message
        ),
        code: 400,
      })
    );
  });

  test('logout deletes the backing session and prevents header and browser replay', async () => {
    const sessionToken = await createDevelopmentSessionMock(DIGID_PROFILE);
    const { req, res: resMock } = await getOidcSessionMock(sessionToken);
    expect(getAuth(req)?.profile.id).toBe(DIGID_PROFILE.id);

    await handleAmsAppAuthLogout(req, resMock);
    await resMock.end();

    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'OK',
        content: expect.objectContaining({
          session: expect.objectContaining({
            name: OIDC_SESSION_COOKIE_NAME,
            invalidated: true,
          }),
        }),
      })
    );

    expect(resMock.clearCookie).toHaveBeenCalledWith(
      OIDC_SESSION_COOKIE_NAME,
      expect.objectContaining({
        path: '/',
        secure: true,
        sameSite: 'lax',
        httpOnly: true,
      })
    );

    expect(
      await promisify(oidcSessionStore.get.bind(oidcSessionStore))(sessionToken)
    ).toBeFalsy();
    expect(getAuth(req)).toBeNull();

    const { req: browserReq, res: browserRes } =
      await getOidcSessionMock(sessionToken);
    expect(getAuth(browserReq)).toBeNull();
    await browserRes.end();

    const headerReq = RequestMock.new().get();
    headerReq.headers = { 'x-amsapp-session-token': sessionToken };
    headerReq.get = vi.fn().mockReturnValue(sessionToken);
    const next = vi.fn();
    await privateNetworkAuthContextMiddleware(
      headerReq,
      createOidcResponseMock(),
      next
    );
    expect(next).toHaveBeenCalledWith();
    expect(getAuth(headerReq)).toBeNull();
  });

  test('logout returns invalid-input contract when session token is missing', async () => {
    const req = {
      headers: {},
    } as Request;

    const resMock = ResponseMock.new();
    await handleAmsAppAuthLogout(req, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        code: 400,
        message: expect.stringContaining(
          apiResponseErrors.INVALID_INPUT.message
        ),
      })
    );
  });

  test.each(['logout', 'idle expiry', 'absolute expiry'])(
    'real OIDC middleware manages a synthetic login without a provider: %s',
    async (termination) => {
      const startedAt = Date.parse('2026-01-01T12:00:00Z');
      MockDate.set(startedAt);
      const startedAtSeconds = Math.floor(startedAt / ONE_SECOND_MS);
      const rollingDurationSeconds = OIDC_SESSION_MAX_AGE_SECONDS;
      const rollingDurationMs = rollingDurationSeconds * ONE_SECOND_MS;
      const absoluteDurationSeconds = rollingDurationSeconds * 2;
      const renewalMarginMs = ONE_MINUTE_MS;
      const renewalAt = startedAt + rollingDurationMs - renewalMarginMs;
      const oidcMiddleware = openIdAuth({
        ...oidcConfigDigid,
        session: {
          ...oidcConfigDigid.session,
          store: oidcSessionStore,
          signSessionStoreCookie: true,
          rollingDuration: rollingDurationSeconds,
          absoluteDuration: absoluteDurationSeconds,
        },
      });
      async function restoreSession(cookieValue = '') {
        return getOidcSessionMock(cookieValue, oidcMiddleware);
      }

      const initial = await restoreSession();
      const sessionData = await createDevelopmentSessionData(DIGID_PROFILE);
      const idToken = sessionData.id_token;
      Object.assign(initial.req[OIDC_SESSION_COOKIE_NAME]!, sessionData);
      await initial.res.end();
      const signedCookie = initial.res.cookie.mock.calls[0][1] as string;
      const sessionId = signedCookie.slice(0, signedCookie.lastIndexOf('.'));
      const readSession = promisify(
        oidcSessionStore.get.bind(oidcSessionStore)
      );
      const initialSession = await readSession(sessionId);
      expect(initialSession?.header.exp).toBe(
        startedAtSeconds + rollingDurationSeconds
      );

      MockDate.set(renewalAt);
      const renewed = await restoreSession(signedCookie);
      expect(renewed.req.oidc.isAuthenticated()).toBe(true);
      expect(getAuth(renewed.req)?.profile).toEqual(DIGID_PROFILE);
      expect(getAuth(renewed.req)?.token).toBe(idToken);
      await renewed.res.end();
      const renewedSession = await readSession(sessionId);
      expect(renewedSession?.header.iat).toBe(initialSession?.header.iat);
      expect(renewedSession?.header.exp).toBe(
        Math.floor(renewalAt / ONE_SECOND_MS) + rollingDurationSeconds
      );

      if (termination === 'idle expiry') {
        MockDate.set(renewalAt + rollingDurationMs);
      }
      if (termination === 'absolute expiry') {
        const absoluteDeadlineAt =
          startedAt + absoluteDurationSeconds * ONE_SECOND_MS;

        MockDate.set(absoluteDeadlineAt - renewalMarginMs - 1);
        const capped = await restoreSession(signedCookie);
        expect(capped.req.oidc.isAuthenticated()).toBe(true);
        await capped.res.end();
        const cappedSession = await readSession(sessionId);
        expect(cappedSession?.header.iat).toBe(initialSession?.header.iat);
        expect(cappedSession?.header.exp).toBe(
          startedAtSeconds + absoluteDurationSeconds
        );
        MockDate.set(absoluteDeadlineAt);
      }
      if (termination === 'logout') {
        const logout = await restoreSession(signedCookie);
        expect(getAuth(logout.req)?.profile.id).toBe(DIGID_PROFILE.id);
        await handleAmsAppAuthLogout(logout.req, logout.res);
        expect(await readSession(sessionId)).toBeTruthy();
        await logout.res.end();
        expect(await readSession(sessionId)).toBeFalsy();
      }

      const replay = await restoreSession(signedCookie);
      expect(replay.req.oidc.isAuthenticated()).toBe(false);
      expect(getAuth(replay.req)).toBeNull();
      await replay.res.end();
    }
  );
});
