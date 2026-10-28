import { promisify } from 'node:util';

import { decodeJwt } from 'jose';
import MockDate from 'mockdate';

import { createOidcResponseMock, RequestMock } from '../../testing/utils.ts';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
} from '../auth/auth-config.ts';
import { authRoutes } from '../auth/auth-routes.ts';
import { ONE_MINUTE_MS, ONE_SECOND_MS } from '../config/app.ts';
import type * as amsAppAuthConfig from '../services/amsapp/auth/amsapp-auth-service-config.ts';

async function requestDevelopmentRoute(
  url: string,
  sessionToken = '',
  query: Record<string, string> = {}
) {
  const { authRouterDevelopment } = await import('./app-router-development.ts');
  const req = RequestMock.new()
    .setUrl(url)
    .setQuery(query)
    .setCookies(
      sessionToken ? { [OIDC_SESSION_COOKIE_NAME]: sessionToken } : {}
    )
    .get();
  Object.assign(req, {
    method: 'GET',
    headers: {
      cookie: sessionToken
        ? `${OIDC_SESSION_COOKIE_NAME}=${encodeURIComponent(sessionToken)}`
        : '',
    },
    get: (name: string) => req.headers[name.toLowerCase()],
  });
  const res = createOidcResponseMock();
  await new Promise<void>((resolve, reject) => {
    const complete = () => {
      resolve();
      return res;
    };
    res.send.mockImplementation(complete);
    res.redirect.mockImplementation(complete);
    authRouterDevelopment(req, res, (error?: unknown) =>
      reject(error ?? new Error(`Development route not handled: ${url}`))
    );
  });
  await res.end();
  return { req, res };
}

describe('development session lifecycle', () => {
  beforeEach(() => MockDate.set('2026-01-01T12:00:00Z'));

  afterEach(() => {
    MockDate.reset();
    vi.restoreAllMocks();
    vi.doUnmock('../services/amsapp/auth/amsapp-auth-service-config.ts');
  });

  test.each([
    { universalAuthEnabled: false, authMethod: 'digid' },
    { universalAuthEnabled: true, authMethod: 'digid' },
    { universalAuthEnabled: false, authMethod: 'eherkenning' },
    { universalAuthEnabled: true, authMethod: 'eherkenning' },
  ] as const)(
    '$authMethod login, renewal, expiry and logout with AMS App enabled: $universalAuthEnabled',
    async ({ universalAuthEnabled, authMethod }) => {
      vi.resetModules();
      vi.doMock(
        '../services/amsapp/auth/amsapp-auth-service-config.ts',
        async (importOriginal) => {
          const actual = await importOriginal<typeof amsAppAuthConfig>();
          return {
            ...actual,
            featureToggle: {
              amsAppUniversalAuthIsActive: universalAuthEnabled,
              amsAppUniversalAuthServicesAllAccessIsActive:
                universalAuthEnabled,
            },
          };
        }
      );
      const envHelpers = await import('../helpers/env.ts');
      const visitors = await import('../services/admin/admin-visitors.ts');
      vi.spyOn(envHelpers, 'getValueFromEnvByKey').mockReturnValue('test-id');
      vi.spyOn(visitors, 'countLoggedInVisit').mockResolvedValue(undefined);
      const { getAuth } = await import('../auth/auth-helpers.ts');
      const { oidcSessionStore } = await import('../auth/auth-config.ts');
      const readSession = promisify(
        oidcSessionStore.get.bind(oidcSessionStore)
      );
      const loginRoute =
        authMethod === 'digid'
          ? authRoutes.AUTH_LOGIN_DIGID
          : authRoutes.AUTH_LOGIN_EHERKENNING;
      const loginQuery = {
        username: 'test-account',
        redirectUrl: 'noredirect',
      };
      const login = await requestDevelopmentRoute(loginRoute, '', loginQuery);
      expect(login.res.send).toHaveBeenCalledWith('ok');
      const sessionToken = login.res.cookie.mock.calls[0][1] as string;
      const initialSession = await readSession(sessionToken);
      expect(initialSession).toBeTruthy();
      const tokenExpiresAt = decodeJwt(initialSession!.data.access_token).exp!;
      expect(initialSession!.data.expires_at).toBe(tokenExpiresAt);
      expect(getAuth(login.req)?.expiresAtMilliseconds).toBe(
        tokenExpiresAt * ONE_SECOND_MS
      );

      MockDate.set(Date.now() + 14 * ONE_MINUTE_MS);
      const restored = await requestDevelopmentRoute(
        authRoutes.AUTH_CHECK,
        sessionToken
      );
      expect(restored.res.statusCode).toBe(200);
      expect(restored.req.oidc.isAuthenticated()).toBe(true);
      expect(getAuth(restored.req)?.profile).toMatchObject({
        id: 'test-id',
        authMethod,
        profileType: authMethod === 'digid' ? 'private' : 'commercial',
      });
      const renewedSession = await readSession(sessionToken);
      expect(renewedSession?.header.iat).toBe(initialSession?.header.iat);
      expect(renewedSession?.header.exp).toBe(
        Math.floor(Date.now() / ONE_SECOND_MS) + OIDC_SESSION_MAX_AGE_SECONDS
      );
      expect(renewedSession!.header.exp).toBeGreaterThan(
        initialSession!.header.exp
      );
      expect(renewedSession!.data.expires_at).toBe(tokenExpiresAt);
      expect(getAuth(restored.req)?.expiresAtMilliseconds).toBe(
        tokenExpiresAt * ONE_SECOND_MS
      );

      await requestDevelopmentRoute(authRoutes.AUTH_LOGOUT, sessionToken);
      expect(await readSession(sessionToken)).toBeFalsy();
      const replay = await requestDevelopmentRoute(
        authRoutes.AUTH_CHECK,
        sessionToken
      );
      expect(replay.res.statusCode).toBe(401);
      expect(getAuth(replay.req)).toBeNull();

      const secondLogin = await requestDevelopmentRoute(
        loginRoute,
        '',
        loginQuery
      );
      const expiringToken = secondLogin.res.cookie.mock.calls[0][1] as string;
      const secondSession = await readSession(expiringToken);
      const secondTokenExpiresAt = decodeJwt(
        secondSession!.data.access_token
      ).exp!;
      expect(secondSession!.data.expires_at).toBe(secondTokenExpiresAt);
      expect(getAuth(secondLogin.req)?.expiresAtMilliseconds).toBe(
        secondTokenExpiresAt * ONE_SECOND_MS
      );
      MockDate.set(Date.now() + OIDC_SESSION_MAX_AGE_SECONDS * ONE_SECOND_MS);
      const expired = await requestDevelopmentRoute(
        authRoutes.AUTH_CHECK,
        expiringToken
      );
      expect(expired.res.statusCode).toBe(401);
      expect(getAuth(expired.req)).toBeNull();
      expect(await readSession(expiringToken)).toBeFalsy();
    }
  );
});
