import { createHash } from 'node:crypto';

import type { Request } from 'express';

import {
  handleAmsAppAuthCallback,
  handleAmsAppAuthLoginStart,
  handleAmsAppAuthLogout,
  handleAmsAppAuthTokenExchange,
} from './amsapp-auth-route-handlers.ts';
import { apiResponseErrors } from './amsapp-auth-service-config.ts';
import {
  clearAmsAppAuthStore,
  createLoginAttempt,
  getByLoginId,
  isSessionTokenRevoked,
  markLoginReady,
} from './amsapp-auth-store.ts';
import { RequestMock, ResponseMock } from '../../../../testing/utils.ts';
import { RETURNTO_AMSAPP_AUTH_CALLBACK } from '../../../auth/auth-after-redirect-returnto.ts';
import { OIDC_SESSION_COOKIE_NAME } from '../../../auth/auth-config.ts';
import type { AuthProfile } from '../../../auth/auth-types.ts';

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
    const codeVerifier = 'test';
    const codeChallenge = 'n4bQgYhMfWWaL-qgxVrQFaO_TxsrC4Is0V1sFbDwCgg'; // createHash('sha256').update(codeVerifier).digest('base64url');

    const loginId = await createLoginAttempt(codeChallenge);
    const readyRecord = await markLoginReady(
      loginId,
      'ma-session-cookie-value'
    );

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
            value: 'ma-session-cookie-value',
            expiresAt: expect.any(Number),
          }),
        }),
      })
    );

    expect(await getByLoginId(loginId)).toBeNull();
  });

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

  test('logout invalidates session token and removes related authorization codes', async () => {
    const codeVerifier = 'mobile-app-code-verifier';
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const sessionToken = 'ma-session-cookie-value';
    const loginId = await createLoginAttempt(codeChallenge);
    const readyRecord = await markLoginReady(loginId, sessionToken);

    const req = {
      headers: {
        'x-amsapp-session-token': sessionToken,
      },
    } as unknown as Request;

    const resMock = ResponseMock.new();
    await handleAmsAppAuthLogout(req, resMock);

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

    expect(await getByLoginId(loginId)).toBeNull();
    expect(await isSessionTokenRevoked(sessionToken)).toBe(true);

    const exchangeReq = {
      body: {
        authorizationCode: readyRecord?.authorizationCode,
        codeVerifier,
      },
    } as Request;

    const exchangeRes = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(exchangeReq, exchangeRes);

    expect(exchangeRes.status).toHaveBeenCalledWith(400);
    expect(exchangeRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        message: expect.stringContaining(
          apiResponseErrors.AUTHORIZATION_CODE_NOT_FOUND_OR_EXPIRED.message
        ),
      })
    );
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
});
