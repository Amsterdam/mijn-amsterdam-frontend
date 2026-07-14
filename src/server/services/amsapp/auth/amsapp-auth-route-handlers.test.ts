import { createHash } from 'node:crypto';

import type { Request } from 'express';

import {
  handleAmsAppAuthCallback,
  handleAmsAppAuthLoginStart,
  handleAmsAppAuthTokenExchange,
} from './amsapp-auth-route-handlers.ts';
import {
  clearAmsAppAuthStore,
  createLoginAttempt,
  getByLoginId,
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
  beforeEach(() => {
    vi.resetAllMocks();
    clearAmsAppAuthStore();
  });

  test('login-start stores code_challenge and redirects to DigiD login', async () => {
    const reqMock = RequestMock.new().setQuery({
      code_challenge: 'test-code-challenge',
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

    const storedLoginAttempt = getByLoginId(loginId!);
    expect(storedLoginAttempt?.codeChallenge).toBe('test-code-challenge');
    expect(storedLoginAttempt?.status).toBe('pending');
  });

  test('callback marks authorization_code ready and returns deeplink', async () => {
    const loginId = createLoginAttempt('code-challenge-123');
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
    expect(renderProps.promptOpenApp).toBe(false);

    const appHref = new URL(renderProps.appHref);
    expect(`${appHref.protocol}//${appHref.host}${appHref.pathname}`).toBe(
      'amsterdam://mijn-amsterdam/gelukt'
    );

    const authorizationCode = appHref.searchParams.get('authorization_code');
    expect(authorizationCode).toBeTruthy();

    const storedLoginAttempt = getByLoginId(loginId);
    expect(storedLoginAttempt?.status).toBe('ready');
    expect(storedLoginAttempt?.authorizationCode).toBe(authorizationCode);
    expect(storedLoginAttempt?.maSessionCookieValue).toBe(
      'ma-session-cookie-value'
    );
  });

  test('token exchange validates PKCE and returns MA session cookie value', async () => {
    const codeVerifier = 'mobile-app-code-verifier';
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const loginId = createLoginAttempt(codeChallenge);
    const readyRecord = markLoginReady(loginId, 'ma-session-cookie-value');

    const req = {
      body: {
        authorization_code: readyRecord?.authorizationCode,
        code_verifier: codeVerifier,
      },
    } as Request;
    const resMock = ResponseMock.new();

    await handleAmsAppAuthTokenExchange(req, resMock);

    expect(resMock.send).toHaveBeenCalledWith({
      status: 'OK',
      content: {
        session: {
          name: OIDC_SESSION_COOKIE_NAME,
          value: 'ma-session-cookie-value',
        },
      },
    });

    expect(getByLoginId(loginId)).toBeNull();
  });

  test('token exchange fails for PKCE mismatch', async () => {
    const codeVerifier = 'mobile-app-code-verifier';
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const loginId = createLoginAttempt(codeChallenge);
    const readyRecord = markLoginReady(loginId, 'ma-session-cookie-value');

    const req = {
      body: {
        authorization_code: readyRecord?.authorizationCode,
        code_verifier: 'other-verifier',
      },
    } as Request;

    const resMock = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(req, resMock);

    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        code: 400,
      })
    );
    expect(getByLoginId(loginId)?.status).toBe('ready');
  });

  test('token exchange is one-time use', async () => {
    const codeVerifier = 'mobile-app-code-verifier';
    const codeChallenge = createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    const loginId = createLoginAttempt(codeChallenge);
    const readyRecord = markLoginReady(loginId, 'ma-session-cookie-value');
    const authorizationCode = readyRecord?.authorizationCode;

    const firstReq = {
      body: {
        authorization_code: authorizationCode,
        code_verifier: codeVerifier,
      },
    } as Request;

    const firstRes = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(firstReq, firstRes);

    const secondReq = {
      body: {
        authorization_code: authorizationCode,
        code_verifier: codeVerifier,
      },
    } as Request;

    const secondRes = ResponseMock.new();
    await handleAmsAppAuthTokenExchange(secondReq, secondRes);

    expect(secondRes.status).toHaveBeenCalledWith(400);
    expect(secondRes.send).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ERROR',
        message: 'Bad request: Unknown or invalid authorization_code',
        code: 400,
      })
    );
  });
});
