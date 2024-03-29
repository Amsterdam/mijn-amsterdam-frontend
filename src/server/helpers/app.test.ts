import express, { NextFunction, Request, Response } from 'express';
import { AccessToken } from 'express-openid-connect';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { bffApi } from '../../test-utils';
import { apiErrorResult, jsonCopy } from '../../universal/helpers';
import * as config from '../config';
import {
  addServiceResultHandler,
  clearRequestCache,
  combineCookieChunks,
  decodeOIDCToken,
  getAuth,
  getAuthProfile,
  getOIDCToken,
  getProfileType,
  hasSessionCookie,
  isAuthenticated,
  isRelayAllowed,
  isSessionCookieName,
  queryParams,
  requestID,
  send404,
  sendMessage,
  sendUnauthorized,
  verifyAuthenticated,
  verifyUserIdWithRemoteUserinfo,
  type TokenData,
  encryptCookieValue,
  decryptCookieValue,
} from './app';
import { cache } from './source-api-request';
import Mockdate from 'mockdate';
import {
  generateDevSessionCookieValue,
  signDevelopmentToken,
} from './app.development';

const {
  oidcConfigDigid,
  oidcConfigEherkenning,
  OIDC_SESSION_COOKIE_NAME,
  EH_ATTR_PRIMARY_ID,
  EH_ATTR_INTERMEDIATE_PRIMARY_ID,
  EH_ATTR_INTERMEDIATE_SECONDARY_ID,
  DIGID_ATTR_PRIMARY,
  EH_ATTR_PRIMARY_ID_LEGACY,
} = config;

vi.mock('../config', async (requireOriginal) => {
  const origModule = (await requireOriginal()) as object;
  return {
    ...origModule,
  };
});

describe('server/helpers/app', () => {
  const digidClientId = oidcConfigDigid.clientID;
  const eherkenningClientId = oidcConfigEherkenning.clientID;

  function getEncryptionHeaders() {
    const uat = (Date.now() / 1000) | 0;
    const iat = uat;
    const exp = iat + config.OIDC_SESSION_MAX_AGE_SECONDS;
    return {
      uat,
      iat,
      exp,
    };
  }

  beforeAll(() => {
    (config as any).OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED = false;
    oidcConfigEherkenning.clientID = 'test1';
    oidcConfigDigid.clientID = 'test2';

    Mockdate.set('2023-11-23');
  });

  afterAll(() => {
    oidcConfigEherkenning.clientID = digidClientId;
    oidcConfigDigid.clientID = eherkenningClientId;

    Mockdate.reset();
  });

  test('enc-dec', async () => {
    const payload = 'testje!!';

    const cookieValueEncrypted = await encryptCookieValue(
      payload,
      getEncryptionHeaders()
    );

    const payload2 = await decryptCookieValue(cookieValueEncrypted);

    expect(payload).toBe(payload2);
  });

  test('getAuth.eherkenning', async () => {
    const cookieValue = await generateDevSessionCookieValue(
      'eherkenning',
      'eh1',
      'eh1-session-id'
    );

    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: cookieValue,
      },
    } as unknown as typeof express.request;

    const result = await getAuth(req);

    expect(result).toMatchInlineSnapshot(`
      {
        "profile": {
          "authMethod": "eherkenning",
          "id": "eh1",
          "profileType": "commercial",
          "sid": "eh1-session-id",
        },
        "token": "eyJhbGciOiJSUzI1NiJ9.eyJ1cm46ZXRvZWdhbmc6Y29yZTpMZWdhbFN1YmplY3RJRCI6ImVoMSIsImF1ZCI6InRlc3QxIiwic2lkIjoiZWgxLXNlc3Npb24taWQiLCJpYXQiOjE3MDA2OTc2MDAsImV4cCI6MTcwMDcwNDgwMH0.g2TuVfherMgdHRxxHoRxWUSydRu4ETg-VOJW-jxLCdk8KejfPANkGNNbT7B_1BZVTwNVC7ThnaAKGzyBg9vL9xnaj2MStEX2HKwjkLWTSzX4voVrAwn7izm3KP7bh0cb68uTNVFZg7Zmy-PpYAJ86lyg0-bLyfImFMvtxkDrINXvGG02ukEZQcjcgL43MtJv3ksR3-lnFxAIMz8sn97gqLCxXEIBA4GkMeWXNkBwh2cjbEJba_b1wN_GybEo-ZoZ9Xh4C2oYJI9fcXc6re8kmZ5xegx1c2xYapy7JBqPfr6D_4vN_ZeR1Ut6PumR8ZzXAdCX5UIqy3WjO9YiKia8Jw",
      }
    `);

    const tokenData = await decodeOIDCToken(result.token);
    const attr = config.OIDC_TOKEN_ID_ATTRIBUTE.eherkenning(tokenData);
    expect(tokenData[attr]).toBe('eh1');
  });

  test('getAuth.digid', async () => {
    const cookieValue = await generateDevSessionCookieValue(
      'digid',
      'digi1',
      'digi1-session-id'
    );
    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: cookieValue,
      },
    } as unknown as typeof express.request;

    const result = await getAuth(req);

    expect(result).toMatchInlineSnapshot(`
      {
        "profile": {
          "authMethod": "digid",
          "id": "digi1",
          "profileType": "private",
          "sid": "digi1-session-id",
        },
        "token": "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJkaWdpMSIsImF1ZCI6InRlc3QyIiwic2lkIjoiZGlnaTEtc2Vzc2lvbi1pZCIsImlhdCI6MTcwMDY5NzYwMCwiZXhwIjoxNzAwNzA0ODAwfQ.TwnEE1aamO3P-_ElwF41jyHAe66caKtN8ysuIuYJ9oaHRuotA1BMp9dp_FDylAbAS8IW2_-WkTAbPBgdgGL_iex1qQqyrKqR8oz9wJ6TXbE84A4urkz8zCM3pdiR8mKoO8gaSA5zWg8iShTMMtfPuMQKqXjzsjbPGgRAmyfp_a-4bz1EiE6jr71xCg4du5ItaJOjP1LgwGnKU0x7xQKvIilWFMod0smXVunklHzo1hTgKyAKcc5Srbl2IW1GKcPPg6sLsjM_6QkNaIEfZF09AG9aGOVImyhJ4cfrDGx2tf6cw4DPEM7WVWr0Z8Pg5VAlqW2-vJs4cclYqIk3EJvDxw",
      }
    `);

    expect((await decodeOIDCToken(result.token)).sub).toBe('digi1');
  });

  test('getAuthProfile', () => {
    {
      const profile = getAuthProfile({
        sub: '-unused-',
        aud: 'test1',
        [EH_ATTR_PRIMARY_ID]: 'EHERKENNING-KVK',
        sid: 'test',
      } as TokenData);

      expect(profile).toStrictEqual({
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: 'EHERKENNING-KVK',
        sid: 'test',
      });
    }

    {
      const profile = getAuthProfile({
        aud: 'test2',
        [DIGID_ATTR_PRIMARY]: 'DIGID-BSN',
        sid: 'test2',
      } as TokenData);

      expect(profile).toStrictEqual({
        authMethod: 'digid',
        profileType: 'private',
        id: 'DIGID-BSN',
        sid: 'test2',
      });
    }

    {
      const profile = getAuthProfile({
        aud: 'test_x',
        [DIGID_ATTR_PRIMARY]: 'DIGID-BSN',
        sid: 'test2b',
      } as TokenData);

      expect(profile).toStrictEqual({
        authMethod: 'digid',
        profileType: 'private',
        id: 'DIGID-BSN',
        sid: 'test2b',
      });
    }

    {
      const profile = getAuthProfile({
        sub: '',
        aud: 'test1',
        [EH_ATTR_PRIMARY_ID]: 'EH-KVK1',
        sid: 'test3',
      } as TokenData);

      expect(profile).toStrictEqual({
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: 'EH-KVK1',
        sid: 'test3',
      });
    }

    {
      const profile = getAuthProfile({
        sub: '',
        aud: 'test1',
        [EH_ATTR_PRIMARY_ID_LEGACY]: 'EH-KVK1',
        sid: 'test4',
      } as TokenData);

      expect(profile).toStrictEqual({
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: 'EH-KVK1',
        sid: 'test4',
      });
    }

    {
      const profile = getAuthProfile({
        sub: '',
        aud: 'test1',
        [EH_ATTR_INTERMEDIATE_PRIMARY_ID]: 'EH-KVK1',
        [EH_ATTR_INTERMEDIATE_SECONDARY_ID]: 'EH-KVK2',
        sid: 'test5',
      } as TokenData);

      expect(profile).toStrictEqual({
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: 'EH-KVK1',
        sid: 'test5',
      });
    }
  });

  test('requestID', () => {
    const mockNext = vi.fn();

    const req = {} as any;
    const res = {
      locals: {},
    } as any;

    requestID(req, res, mockNext);
    expect(res.locals.requestID).toBeDefined();
    expect(typeof res.locals.requestID).toBe('string');
    expect(mockNext).toHaveBeenCalled();
  });

  test('send404', () => {
    const mockRes = {
      status: vi.fn(),
      send: vi.fn(),
    };

    send404(mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith(
      apiErrorResult('Not Found', null)
    );
  });

  test('sendUnauthorized', () => {
    const mockRes = {
      status: vi.fn(),
      send: vi.fn(),
    };

    sendUnauthorized(mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith(
      apiErrorResult('Unauthorized', null)
    );
  });

  test('clearRequestCache', () => {
    const requestID = '11223300xx';
    cache.put(requestID, { foo: 'bar' });

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });

    clearRequestCache({} as any, { locals: { requestID } } as any);

    expect(cache.get(requestID)).toBe(null);
    expect(cache.keys()).toEqual([]);
  });

  test('clearRequestCache.unknown.key', () => {
    const requestID = '11223300xx';
    const nextMock = vi.fn();
    cache.put(requestID, { foo: 'bar' });

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });

    clearRequestCache(
      {} as any,
      { locals: { requestID: 'some_other_key' } } as any
    );

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });
    expect(cache.keys()).toEqual([requestID]);
  });

  test('sendMessage', () => {
    const res = {
      write: vi.fn(),
    };
    sendMessage(res as any, 'test', 'data-message', { foo: 'bar' });

    expect(res.write).toHaveBeenCalledWith(
      `event: data-message\nid: test\ndata: {"foo":"bar"}\n\n`
    );
  });

  test('addServiceResultHandler', async () => {
    const data = { foo: 'bar' };
    const servicePromise = Promise.resolve(data);
    const res = {
      write: vi.fn(),
    };
    const result = await addServiceResultHandler(
      res as any,
      servicePromise,
      'test-service'
    );
    expect(res.write).toHaveBeenCalledWith(
      `event: message\nid: test-service\ndata: {"foo":"bar"}\n\n`
    );
    expect(result).toEqual(data);
  });

  test('queryParams', () => {
    const result = queryParams({ query: 'test' } as any);
    expect(result).toBe('test');
  });

  test('getProfileType', async () => {
    const cookieValue = await generateDevSessionCookieValue(
      'digid',
      'digi1',
      'digi1-session-id'
    );

    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: cookieValue,
      },
    } as unknown as typeof express.request;
    {
      const result = await getProfileType(req);
      expect(result).toBe('private');
    }
  });

  test('getOIDCToken.success', async () => {
    const jweCookieString = await encryptCookieValue(
      JSON.stringify({ id_token: 'foobar' }),
      getEncryptionHeaders()
    );

    expect(await getOIDCToken(jweCookieString)).toMatchInlineSnapshot(
      '"foobar"'
    );
  });

  test('getOIDCToken.fail', async () => {
    const jweCookieString =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjUwNjIyMTM2LCJ1YXQiOjE2NTA2MjIxMzYsImV4cCI6MTY1MDYyMzAzNn0..WJ7z2STbwGapmA7T.efCR3f_rH43BbxSzg7FhHE4zTpjOOA6TRG8KpKw7v_YsEJpmreToyymMPqpiavdHQWsYy13tdArS_B5C-rsTeXPwu53iHDj-RWJJKMt1ojipgB47tEW-T5VA1ZCE4mNRUxuYwHF8Q0S4vat4ZPT6M0Z_ktUznc7yaUtWyQOHsFSW39Ly9vF1cC4JydAfgDw8gosC-_DWSlWtLzSiTUSapH16VSznedPBISMxruukge2dLaCv-khKUKrtPUe3g8JSPO524iSphE47xFefzQNbrj-xQu9__uH31P_XKpxqoJ7O4PzQcgcq2EKxEqmvALRjh86pvSipSK5qVLv4wb1AHqnnd6O5fJkVT4n6W46W9g4B-4duYsFkM8OI6Z0YPUGhjx0DgurdVKLaBZM_gL782rEWDBjRAJD62Mn6MBxverk6Y8auFhontxUypKXh-2RmubkCgFJi473N3ozeeWGFAg550lNxIMY77YvGgKqPXXPUn9ye6l_8I1LpGEniyPnqZsJN8s0aeL2G6hcpChTgBErQ5liaf0XoyX3hEpi7cTNYwGxat1KuuVP5iQtdiWHxp6k-jhRxxLW96SYlpO56O5W3aMP5iJzPt-TVnwF2VnR-9AWzS_jtF3MSsvX35Pq_E-aRha7YHPeI9B4RmjDBx7GLAdYS5X7L33gR9hYZml30UJ0tpnJywvDT-UmBYrPzdns3U3ATiVrgPHgq3HR1n0HdALePCHzSd3sIriDZmKG2wWbwC51KzM5OG3vPmt19N75K.TJ6JzT9e18M_R9KgG9qzwg';

    let err;
    try {
      await getOIDCToken(jweCookieString);
    } catch (error: any) {
      err = error.toString();
    }
    expect(err).toBe('JWEDecryptionFailed: decryption operation failed');
  });

  test('decodeOIDCToken', async () => {
    const jweCookieString = await encryptCookieValue(
      JSON.stringify({
        id_token: await signDevelopmentToken(
          'eherkenning',
          'eh2',
          'eh2-session-id'
        ),
      }),
      getEncryptionHeaders()
    );

    const token = await getOIDCToken(jweCookieString);

    expect(await decodeOIDCToken(token)).toMatchInlineSnapshot(`
      {
        "aud": "test1",
        "exp": 1700704800,
        "iat": 1700697600,
        "sid": "eh2-session-id",
        "urn:etoegang:core:LegalSubjectID": "eh2",
      }
    `);
  });

  test('isRelayAllowed', () => {
    expect(isRelayAllowed('/services/all')).toBe(false);
    expect(isRelayAllowed('/brp/brp')).toBe(false);
    expect(isRelayAllowed('')).toBe(false);
    expect(isRelayAllowed('/')).toBe(false);
    expect(isRelayAllowed('/brp/aantal_bewoners')).toBe(true);
  });

  test('combineCookieChunks', () => {
    const cookies = {
      '__MA-appSession.0': 'xxxx',
      somethingelse: 'foobar',
      '__MA-appSession.1': 'yyyy',
      '__MA-appSession.2': 'zzzz',
    };
    expect(combineCookieChunks(cookies)).toBe('xxxxyyyyzzzz');
  });

  test('isSessionCookieName', () => {
    let name = '__MA-appSession.0';
    expect(isSessionCookieName(name)).toBe(true);
    name = '__MA-appSession';
    expect(isSessionCookieName(name)).toBe(true);
    name = 'MA-appSession';
    expect(isSessionCookieName(name)).toBe(false);
  });

  test('hasSessionCookie', () => {
    {
      const req = {
        cookies: {
          [OIDC_SESSION_COOKIE_NAME]: 'test',
        },
      } as unknown as Request;

      expect(hasSessionCookie(req)).toBe(true);
    }
    {
      const req = {
        cookies: {
          [OIDC_SESSION_COOKIE_NAME + '.1']: 'test',
        },
      } as Request;

      expect(hasSessionCookie(req)).toBe(true);
    }
    {
      const req = {
        cookies: {
          blap: 'test',
        },
      } as unknown as Request;

      expect(hasSessionCookie(req)).toBe(false);
    }
  });

  test('verifyUserIdWithRemoteUserinfo', async () => {
    bffApi
      .get('/oidc/userinfo')
      .times(2)
      .reply(200, config.DEV_JWT)
      .get('/oidc/userinfo')
      .times(1)
      .reply(401, '');

    // Happy
    expect(
      await verifyUserIdWithRemoteUserinfo(
        'digid',
        {
          token_type: 'Bearer',
          access_token: config.DEV_JWT,
        } as AccessToken,
        '1234567890'
      )
    ).toBe(true);

    // Wrong value
    expect(
      await verifyUserIdWithRemoteUserinfo(
        'digid',
        {
          token_type: 'Bearer',
          access_token: config.DEV_JWT,
        } as AccessToken,
        '908979'
      )
    ).toBe(false);

    // Incorrect types for arguments (undefined)
    expect(
      await verifyUserIdWithRemoteUserinfo('digid', {
        token_type: 'Bearer',
        access_token: config.DEV_JWT,
      } as AccessToken)
    ).toBe(false);

    // Incorrect types for arguments (undefined)
    expect(await verifyUserIdWithRemoteUserinfo('digid')).toBe(false);

    // Reply with 401
    expect(
      await verifyUserIdWithRemoteUserinfo(
        'digid',
        {
          token_type: 'Bearer',
          access_token: config.DEV_JWT,
        } as AccessToken,
        '1234567890'
      )
    ).toBe(false);
  });

  test('isAuthenticated.false', async () => {
    const req = {
      cookies: {
        blap: 'test',
      },
    } as unknown as Request;

    const res = {
      send: vi.fn().mockImplementation((responseContent: any) => {
        return responseContent;
      }),
      status: vi.fn(),
    } as unknown as Response;

    expect(
      await isAuthenticated(req, res, vi.fn() as unknown as NextFunction)
    ).toStrictEqual({
      content: null,
      message: 'Unauthorized',
      status: 'ERROR',
    });

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('isAuthenticated.true', async () => {
    const jweCookieString = await encryptCookieValue(
      JSON.stringify({
        id_token: await signDevelopmentToken(
          'eherkenning',
          'eh2',
          'eh2-session-id'
        ),
      }),
      getEncryptionHeaders()
    );

    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: jweCookieString,
      },
    } as unknown as Request;

    const res = {
      send: vi.fn().mockImplementation((responseContent: any) => {
        return responseContent;
      }),
      status: vi.fn(),
    } as unknown as Response;

    const nextFn = vi.fn();

    await isAuthenticated(req, res, nextFn);

    expect(nextFn).toHaveBeenCalled();
  });

  test('verifyAuthenticated', async () => {
    const jweCookieString = await encryptCookieValue(
      JSON.stringify({
        id_token: await signDevelopmentToken(
          'digid',
          '1234567890',
          'digi2-session-id'
        ),
      }),
      getEncryptionHeaders()
    );

    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: jweCookieString,
      },
      oidc: {
        isAuthenticated: vi.fn().mockReturnValueOnce(true),
        accessToken: {
          access_token: '',
          token_type: 'Bearer',
        },
      },
    } as unknown as Request;

    const res = {
      send: vi.fn().mockImplementation((responseContent: any) => {
        return responseContent;
      }),
      status: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as Response;

    const responseUnauthorized = {
      content: null,
      message: 'Unauthorized',
      status: 'ERROR',
    };

    const verify = verifyAuthenticated('digid', 'private');
    // ////
    bffApi.get('/oidc/userinfo').times(1).reply(401, '');

    expect(await verify(req, res)).toStrictEqual(responseUnauthorized);

    expect(res.clearCookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);

    ////
    req.oidc.isAuthenticated = vi.fn().mockReturnValueOnce(false);
    expect(await verify(req, res)).toStrictEqual(responseUnauthorized);

    ////
    req.oidc.isAuthenticated = vi.fn().mockReturnValueOnce(true);
    bffApi.get('/oidc/userinfo').times(1).reply(200, config.DEV_JWT);

    expect(await verify(req, res)).toStrictEqual({
      content: {
        isAuthenticated: true,
        profileType: 'private',
        authMethod: 'digid',
      },
      status: 'OK',
    });

    // ////
    // const req2 = jsonCopy(req);
    // bffApi.get('/oidc/userinfo').times(1).reply(200, config.DEV_JWT);
    // req2.oidc.isAuthenticated = vi.fn().mockReturnValueOnce(true);
    // req2.cookies = {};
    // expect(await verify(req2, res)).toStrictEqual(responseUnauthorized);
  });
});
