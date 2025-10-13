import Mockdate from 'mockdate';

import { forTesting } from './router-oidc';
import { bffApiHost } from '../../testing/setup';
import {
  getAuthProfileAndToken,
  getReqMockWithOidc,
  RequestMock,
  ResponseMock,
} from '../../testing/utils';
import {
  OIDC_SESSION_COOKIE_NAME,
  oidcConfigDigid,
  oidcConfigEherkenning,
} from '../auth/auth-config';
import { authRoutes } from '../auth/auth-routes';
import { getFromEnv } from '../helpers/env';
import { apiRoute } from './route-helpers';

const mocks = vi.hoisted(() => {
  const openIdAuthHandlerEH = vi.fn();
  const openIdAuthHandlerDigid = vi.fn();
  const oidcConfigDigid = vi.fn();
  const oidcConfigEherkenning = vi.fn();

  return {
    oidcConfigDigid,
    oidcConfigEherkenning,
    openIdAuth: vi.fn().mockImplementation((config) => {
      return config === oidcConfigDigid
        ? openIdAuthHandlerDigid
        : openIdAuthHandlerEH;
    }),
    openIdAuthHandlerEH,
    openIdAuthHandlerDigid,
  };
});

describe('router-oids', () => {
  beforeAll(() => {
    Mockdate.set('2025-03-27');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  describe('authCheckHandler', () => {
    test('authenticated digid', async () => {
      const authProfileAndToken = getAuthProfileAndToken();
      const reqMock = await getReqMockWithOidc(authProfileAndToken.profile);
      const resMock = ResponseMock.new();

      await forTesting.authCheckHandler(reqMock, resMock);

      expect(resMock.send).toHaveBeenLastCalledWith({
        content: {
          authMethod: 'digid',
          expiresAtMilliseconds: 1743034500000,
          isAuthenticated: true,
          profileType: 'private',
        },
        status: 'OK',
      });
    });

    test('authenticated eherkenning', async () => {
      const authProfileAndToken = getAuthProfileAndToken('commercial');
      const reqMock = await getReqMockWithOidc(authProfileAndToken.profile);
      const resMock = ResponseMock.new();

      await forTesting.authCheckHandler(reqMock, resMock);

      expect(resMock.send).toHaveBeenLastCalledWith({
        content: {
          authMethod: 'eherkenning',
          expiresAtMilliseconds: 1743034500000,
          isAuthenticated: true,
          profileType: 'commercial',
        },
        status: 'OK',
      });
    });

    test('not authenticated', async () => {
      const reqMock = RequestMock.new().get();
      const resMock = ResponseMock.new();

      await forTesting.authCheckHandler(reqMock, resMock);

      expect(resMock.send).toHaveBeenLastCalledWith({
        code: 401,
        content: null,
        message: 'Unauthorized',
        status: 'ERROR',
      });
    });

    test('wrong auth method', async () => {
      const authProfileAndToken = getAuthProfileAndToken('commercial');
      authProfileAndToken.profile.authMethod =
        'some-other-unexisting-auth-method' as AuthMethod;

      const reqMock = await getReqMockWithOidc(authProfileAndToken.profile);
      const resMock = ResponseMock.new();

      await forTesting.authCheckHandler(reqMock, resMock);

      expect(resMock.send).toHaveBeenLastCalledWith({
        code: 401,
        content: null,
        message: 'Unauthorized',
        status: 'ERROR',
      });
    });
  });

  describe('authConfigHandler', () => {
    vi.mock('../auth/auth-config', async (importOriginal) => {
      return {
        ...((await importOriginal()) as object),
        oidcConfigDigid: mocks.oidcConfigDigid,
        oidcConfigEherkenning: mocks.oidcConfigEherkenning,
        openIdAuth: mocks.openIdAuth,
      };
    });

    test('Digid config', () => {
      const reqMock = RequestMock.new().setUrl(
        `${bffApiHost}/api/v1/auth/digid/check`
      );
      const resMock = ResponseMock.new();
      const nextMock = vi.fn();

      forTesting.authConfigHandler(reqMock, resMock, nextMock);

      expect(forTesting.authInstances.size).toBe(1);
      expect(mocks.openIdAuth).toHaveBeenCalledWith(mocks.oidcConfigDigid);
      expect(mocks.openIdAuthHandlerDigid).toHaveBeenCalledWith(
        reqMock,
        resMock,
        nextMock
      );

      forTesting.authConfigHandler(reqMock, resMock, nextMock);
      expect(forTesting.authInstances.size).toBe(1);
    });

    test('EHerkenning config', () => {
      const reqMock = RequestMock.new().setUrl(
        `${bffApiHost}/api/v1/auth/eherkenning/check`
      );
      const resMock = ResponseMock.new();
      const nextMock = vi.fn();

      forTesting.authConfigHandler(reqMock, resMock, nextMock);

      // forTesting.authInstances is not cleared so we now have an instance from the previous test (Digid config) as well
      expect(forTesting.authInstances.size).toBe(2);
      expect(mocks.openIdAuth).toHaveBeenCalledWith(
        mocks.oidcConfigEherkenning
      );
      expect(mocks.openIdAuthHandlerEH).toHaveBeenCalledWith(
        reqMock,
        resMock,
        nextMock
      );

      forTesting.authConfigHandler(reqMock, resMock, nextMock);
      expect(forTesting.authInstances.size).toBe(2);
    });
  });

  describe('authLogoutHandler', () => {
    test('Digid based on session data and cookie', async () => {
      const authProfileAndToken = getAuthProfileAndToken();
      const reqMock = await getReqMockWithOidc(authProfileAndToken.profile);

      (reqMock as unknown as RequestMock).setCookies({
        [OIDC_SESSION_COOKIE_NAME]: 'foo-bar',
      });

      const resMock = ResponseMock.new();

      forTesting.authLogoutHandler(reqMock, resMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        apiRoute(authRoutes.AUTH_LOGOUT_DIGID)
      );
    });

    test('Digid no cookie', async () => {
      const reqMock = RequestMock.new().get();
      const resMock = ResponseMock.new();

      forTesting.authLogoutHandler(reqMock, resMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        getFromEnv('MA_FRONTEND_URL', true)
      );
    });

    test('Eherkenning based on session data and cookie', async () => {
      const authProfileAndToken = getAuthProfileAndToken('commercial');
      const reqMock = await getReqMockWithOidc(authProfileAndToken.profile);

      (reqMock as unknown as RequestMock).setCookies({
        [OIDC_SESSION_COOKIE_NAME]: 'foo-bar',
      });

      const resMock = ResponseMock.new();

      forTesting.authLogoutHandler(reqMock, resMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        apiRoute(authRoutes.AUTH_LOGOUT_EHERKENNING)
      );
    });

    test('Logout explicit by known query.authMethod Digid', async () => {
      const reqMock = RequestMock.new().setQuery({ authMethod: 'digid' }).get();
      const resMock = ResponseMock.new();

      forTesting.authLogoutHandler(reqMock, resMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        apiRoute(authRoutes.AUTH_LOGOUT_DIGID)
      );
    });
    test('Logout explicit by known query.authMethod EHerkenning', async () => {
      const reqMock = RequestMock.new()
        .setQuery({ authMethod: 'eherkenning' })
        .get();
      const resMock = ResponseMock.new();

      forTesting.authLogoutHandler(reqMock, resMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        apiRoute(authRoutes.AUTH_LOGOUT_EHERKENNING)
      );
    });

    test('Logout explicit by unknown query.authMethod', async () => {
      const reqMock = RequestMock.new()
        .setQuery({ authMethod: 'something' })
        .get();
      const resMock = ResponseMock.new();

      forTesting.authLogoutHandler(reqMock, resMock);

      expect(resMock.redirect).toHaveBeenCalledWith(
        getFromEnv('MA_FRONTEND_URL', true)
      );
    });
  });

  describe('getOidcConfigByRequest', () => {
    test('Digid', () => {
      const reqMock = RequestMock.new()
        .setUrl(`${bffApiHost}/api/v1/auth/digid`)
        .get();
      expect(forTesting.getOidcConfigByRequest(reqMock)).toBe(oidcConfigDigid);
    });

    test('eherkenning', () => {
      const reqMock = RequestMock.new()
        .setUrl(`${bffApiHost}/api/v1/auth/eherkenning`)
        .get();
      expect(forTesting.getOidcConfigByRequest(reqMock)).toBe(
        oidcConfigEherkenning
      );
    });

    test('unknown', () => {
      const reqMock = RequestMock.new()
        .setUrl(`${bffApiHost}/api/v1/auth/other`)
        .get();
      expect(forTesting.getOidcConfigByRequest(reqMock)).toBe(oidcConfigDigid);
    });
  });
});
