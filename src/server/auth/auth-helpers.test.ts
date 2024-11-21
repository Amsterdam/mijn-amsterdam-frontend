import { Request } from 'express';

import {
  DIGID_ATTR_PRIMARY,
  EH_ATTR_INTERMEDIATE_PRIMARY_ID,
  EH_ATTR_INTERMEDIATE_SECONDARY_ID,
  EH_ATTR_PRIMARY_ID,
  EH_ATTR_PRIMARY_ID_LEGACY,
  OIDC_SESSION_COOKIE_NAME,
  RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER,
} from './auth-config';
import {
  createLogoutHandler,
  getAuthProfile,
  getReturnToUrl,
  hasSessionCookie,
  isSessionCookieName,
} from './auth-helpers';
import { MaSession, TokenData } from './auth-types';
import {
  getAuthProfileAndToken,
  getReqMockWithOidc,
  RequestMock,
  ResponseMock,
} from '../../testing/test-utils';
import * as blacklist from '../services/session-blacklist';

describe('auth-helpers', () => {
  test('isSessionCookieName', () => {
    let name = '__MA-appSession';
    expect(isSessionCookieName(name)).toBe(true);
    name = 'MA-appSession';
    expect(isSessionCookieName(name)).toBe(false);
  });

  test('hasSessionCookie', () => {
    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: 'test',
      },
    } as unknown as Request;

    expect(hasSessionCookie(req)).toBe(true);
  });

  test('getAuthProfile', () => {
    {
      const profile = getAuthProfile(
        {
          authMethod: 'eherkenning',
          profileType: 'commercial',
          sid: 'overridden',
        } as MaSession,
        {
          sub: '-unused-',
          aud: 'test1',
          [EH_ATTR_PRIMARY_ID]: 'EHERKENNING-KVK',
          sid: 'test',
        } as TokenData
      );

      expect(profile).toStrictEqual({
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: 'EHERKENNING-KVK',
        sid: 'overridden',
      });
    }

    {
      const profile = getAuthProfile(
        {
          authMethod: 'digid',
          profileType: 'private',
          sid: 'overridden',
        } as MaSession,
        {
          aud: 'test2',
          [DIGID_ATTR_PRIMARY]: 'DIGID-BSN',
          sid: 'test2',
        } as TokenData
      );

      expect(profile).toStrictEqual({
        authMethod: 'digid',
        profileType: 'private',
        id: 'DIGID-BSN',
        sid: 'overridden',
      });
    }

    {
      const profile = getAuthProfile(
        {
          authMethod: 'digid',
          profileType: 'private',
          sid: 'overridden',
        } as MaSession,
        {
          aud: 'test_x',
          [DIGID_ATTR_PRIMARY]: 'DIGID-BSN',
          sid: 'test2b',
        } as TokenData
      );

      expect(profile).toStrictEqual({
        authMethod: 'digid',
        profileType: 'private',
        id: 'DIGID-BSN',
        sid: 'overridden',
      });
    }

    {
      const profile = getAuthProfile(
        {
          authMethod: 'eherkenning',
          profileType: 'commercial',
          sid: 'overridden',
        } as MaSession,
        {
          sub: '',
          aud: 'test1',
          [EH_ATTR_PRIMARY_ID]: 'EH-KVK1',
          sid: 'test3',
        } as TokenData
      );

      expect(profile).toStrictEqual({
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: 'EH-KVK1',
        sid: 'overridden',
      });
    }

    {
      const profile = getAuthProfile(
        {
          authMethod: 'eherkenning',
          profileType: 'commercial',
          sid: 'overridden',
        } as MaSession,
        {
          sub: '',
          aud: 'test1',
          [EH_ATTR_PRIMARY_ID_LEGACY]: 'EH-KVK1',
          sid: 'test4',
        } as TokenData
      );

      expect(profile).toStrictEqual({
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: 'EH-KVK1',
        sid: 'overridden',
      });
    }

    {
      const profile = getAuthProfile(
        {
          authMethod: 'eherkenning',
          profileType: 'commercial',
          sid: 'overridden',
        } as MaSession,
        {
          sub: '',
          aud: 'test1',
          [EH_ATTR_INTERMEDIATE_PRIMARY_ID]: 'EH-KVK1',
          [EH_ATTR_INTERMEDIATE_SECONDARY_ID]: 'EH-KVK2',
          sid: 'test5',
        } as TokenData
      );

      expect(profile).toStrictEqual({
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: 'EH-KVK1',
        sid: 'overridden',
      });
    }
  });

  describe('createLogoutHandler', async () => {
    const authProfileAndToken = getAuthProfileAndToken('commercial');
    const reqMock = await getReqMockWithOidc(authProfileAndToken.profile);

    (reqMock as unknown as RequestMock).setCookies({
      [OIDC_SESSION_COOKIE_NAME]: 'foo-bar',
    });

    const resMock = ResponseMock.new();

    (resMock as any).oidc = {
      logout: vi.fn(),
    };

    const addToBlackListSpy = vi.spyOn(blacklist, 'addToBlackList');

    beforeEach(() => {
      addToBlackListSpy.mockClear();
    });

    test('Authenticated IDP logout', async () => {
      const handler = createLogoutHandler('http://foo.bar');

      await handler(reqMock, resMock);

      expect(resMock.oidc.logout).toHaveBeenCalledWith({
        logoutParams: {
          id_token_hint: null,
          logout_hint: 'xx-tma-sid-xx',
        },
        returnTo: 'http://foo.bar',
      });

      expect(addToBlackListSpy).toHaveBeenCalledWith(
        authProfileAndToken.profile.sid
      );
    });

    test('Local logout', async () => {
      const handler2 = createLogoutHandler('http://foo.bar', false);

      await handler2(reqMock, resMock);

      expect(resMock.clearCookie).toHaveBeenCalled();
      expect(resMock.redirect).toHaveBeenCalledWith('http://foo.bar');
      expect(addToBlackListSpy).not.toHaveBeenCalled();
    });
  });
  describe('getReturnToUrl', () => {
    test('getReturnToUrl should return the corrent zaak-status url', () => {
      const url = getReturnToUrl({
        returnTo: '/zaak-status',
        id: 'Z%2F000%2F000001',
        thema: 'vergunningen',
      });

      expect(url).toBe(
        'http://frontend-host/zaak-status?id=Z%2F000%2F000001&thema=vergunningen'
      );
    });

    test('getReturnToUrl should return the corrent RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER  url', () => {
      const url = getReturnToUrl({
        returnTo: RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER,
        'amsapp-session-token': 'foo-bar',
      });

      expect(url).toBe(
        'http://bff-api-host/api/v1/services/amsapp/stadspas/administratienummer/foo-bar'
      );
    });

    test('getReturnUrl should return the landingpage when no returnTo is provided', () => {
      const url = getReturnToUrl({});

      expect(url).toBe('/api/v1/auth/digid/login/landing');
    });
  });
});
