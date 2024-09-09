import { Request } from 'express';
import {
  DIGID_ATTR_PRIMARY,
  EH_ATTR_INTERMEDIATE_PRIMARY_ID,
  EH_ATTR_INTERMEDIATE_SECONDARY_ID,
  EH_ATTR_PRIMARY_ID,
  EH_ATTR_PRIMARY_ID_LEGACY,
  OIDC_SESSION_COOKIE_NAME,
} from './auth-config';
import {
  getAuthProfile,
  hasSessionCookie,
  isSessionCookieName,
} from './auth-helpers';
import { SessionData, TokenData } from './auth-types';
import UID from 'uid-safe';

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
        } as SessionData,
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
        } as SessionData,
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
        } as SessionData,
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
        } as SessionData,
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
        } as SessionData,
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
        } as SessionData,
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
});
