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
import { RETURNTO_AMSAPP_AUTH_CALLBACK } from '../../../auth/auth-after-redirect-returnto.ts';
import type { AuthProfile } from '../../../auth/auth-types.ts';
import { RequestMock, ResponseMock } from '../../../../testing/utils.ts';

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
    const reqMock = RequestMock.new().setParams({ loginId });
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
  });

  test('token exchange route responds for a ready authorization_code', async () => {
    const loginId = createLoginAttempt('code-challenge-123');
    const readyRecord = markLoginReady(loginId);

    const req = {
      body: {
        authorization_code: readyRecord?.authorizationCode,
      },
    } as Request;
    const resMock = ResponseMock.new();

    await handleAmsAppAuthTokenExchange(req, resMock);

    expect(resMock.send).toHaveBeenCalledWith({
      status: 'OK',
      content: {
        login_id: loginId,
        status: 'ready',
      },
    });
  });
});
