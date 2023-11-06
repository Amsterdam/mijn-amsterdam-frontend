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
} from './app';
import { cache } from './source-api-request';

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
  const secret = config.OIDC_COOKIE_ENCRYPTION_KEY;

  const jweCookieString =
    'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjUwNjIwMTMzLCJ1YXQiOjE2NTA2MjAxMzMsImV4cCI6MTY1MDYyMTAzM30..WJ7z2STbwGapmA7T.efCR3f_rH43BbxSzg7FhHE4zTpjOOA6TRG8KpKw7v_YsEJpmreToyymMPqpiavdHQWsYy13tdArS_B5C-rsTeXPwu53iHDj-RWJJKMt1ojipgB47tEW-T5VA1ZCE4mNRUxuYwHF8Q0S4vat4ZPT6M0Z_ktUznc7yaUtWyQOHsFSW39Ly9vF1cC4JydAfgDw8gosC-_DWSlWtLzSiTUSapH16VSznedPBISMxruukge2dLaCv-khKUKrtPUe3g8JSPO524iSphE47xFefzQNbrj-xQu9__uH31P_XKpxqoJ7O4PzQcgcq2EKxEqmvALRjh86pvSipSK5qVLv4wb1AHqnnd6O5fJkVT4n6W46W9g4B-4duYsFkM8OI6Z0YPUGhjx0DgurdVKLaBZM_gL782rEWDBjRAJD62Mn6MBxverk6Y8auFhontxUypKXh-2RmubkCgFJi473N3ozeeWGFAg550lNxIMY77YvGgKqPXXPUn9ye6l_8I1LpGEniyPnqZsJN8s0aeL2G6hcpChTgBErQ5liaf0XoyX3hEpi7cTNYwGxat1KuuVP5iQtdiWHxp6k-jhRxxLW96SYlpO56O5W3aMP5iJzPt-TVnwF2VnR-9AWzS_jtF3MSsvX35Pq_E-aRha7YHPeI9B4RmjDBx7GLAdYS5X7L33gR9hYZml30UJ0tpnJywvDT-UmBYrPzdns3U3ATiVrgPHgq3HR1n0HdALePCHzSd3sIriDZmKG2wWbwC51KzM5OG3vPmt19N75K.TJ6JzT9e18M_R9KgG9qzwg';

  let isOidcTokenVerificationEnabled =
    config.OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED;

  beforeAll(() => {
    (config as any).OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED = false;
    oidcConfigEherkenning.clientID = 'test1';
    oidcConfigDigid.clientID = 'test2';
    (config.OIDC_COOKIE_ENCRYPTION_KEY as any) = '123123123kjhkjhsdkjfhsd';
  });

  afterAll(() => {
    (config as any).OIDC_IS_TOKEN_EXP_VERIFICATION_ENABLED =
      isOidcTokenVerificationEnabled;
    oidcConfigEherkenning.clientID = digidClientId;
    oidcConfigDigid.clientID = eherkenningClientId;
    (config.OIDC_COOKIE_ENCRYPTION_KEY as any) = secret;
  });

  test('getAuth.eherkenning', async () => {
    const cookieValue =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjUwNjIwMTMzLCJ1YXQiOjE2NTA2MjAxMzMsImV4cCI6MTY1MDYyMTAzM30..WJ7z2STbwGapmA7T.efCR3f_rH43BbxSzg7FhHE4zTpjOOA6TRG8KpKw7v_YsEJpmreToyymMPqpiavdHQWsYy13tdArS_B5C-rsTeXPwu53iHDj-RWJJKMt1ojipgB47tEW-T5VA1ZCE4mNRUxuYwHF8Q0S4vat4ZPT6M0Z_ktUznc7yaUtWyQOHsFSW39Ly9vF1cC4JydAfgDw8gosC-_DWSlWtLzSiTUSapH16VSznedPBISMxruukge2dLaCv-khKUKrtPUe3g8JSPO524iSphE47xFefzQNbrj-xQu9__uH31P_XKpxqoJ7O4PzQcgcq2EKxEqmvALRjh86pvSipSK5qVLv4wb1AHqnnd6O5fJkVT4n6W46W9g4B-4duYsFkM8OI6Z0YPUGhjx0DgurdVKLaBZM_gL782rEWDBjRAJD62Mn6MBxverk6Y8auFhontxUypKXh-2RmubkCgFJi473N3ozeeWGFAg550lNxIMY77YvGgKqPXXPUn9ye6l_8I1LpGEniyPnqZsJN8s0aeL2G6hcpChTgBErQ5liaf0XoyX3hEpi7cTNYwGxat1KuuVP5iQtdiWHxp6k-jhRxxLW96SYlpO56O5W3aMP5iJzPt-TVnwF2VnR-9AWzS_jtF3MSsvX35Pq_E-aRha7YHPeI9B4RmjDBx7GLAdYS5X7L33gR9hYZml30UJ0tpnJywvDT-UmBYrPzdns3U3ATiVrgPHgq3HR1n0HdALePCHzSd3sIriDZmKG2wWbwC51KzM5OG3vPmt19N75K.TJ6JzT9e18M_R9KgG9qzwg';

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
          "id": "123-eherkenning-321",
          "profileType": "commercial",
          "sid": undefined,
        },
        "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjhZTjNwTkRVVXloby10UUIyNWFmcThES0NyeHQyVi1iUzZXOWdSazBjZ2sifQ.eyJ1cm46ZXRvZWdhbmc6MS45OkVudGl0eUNvbmNlcm5lZElEOkt2S25yIjoiMTIzLWVoZXJrZW5uaW5nLTMyMSIsImF1ZCI6InRlc3QxIiwiaWF0IjoxNjUwNjIwMTMzfQ.qF2JLBflk_ajk11jiyrZqcLklB618aSVjnazeDAyljdRJMN_vUUqVZBNLgLI0CBZ_jTYQwbl2OQsizGIdp9_yUadu1FhU4xGHYFBXvtLmdUk049bLccJoFIFYrvJq9yMAUhhRrBLjUUPJN3M8KijF7JKG74QYwyKyL-MzvsvKOqQNLJKUgQ4wUbsY2n9SjPcWGtB6rvkHrbfGGZZmdozIKXWmsQMYP41cEL9E0S15iF78Zko8jaWiV9oUHNqy3CfyZJz-K0dCbPAhs73q_7NqZQF1UoRgw8cQCVpfami521KpS7U6PK6oYlrigF1sHhsN_MuCwVHeOtu_BvBo_IFMQ",
      }
    `);

    const tokenData = await decodeOIDCToken(result.token);
    const attr = config.OIDC_TOKEN_ID_ATTRIBUTE.eherkenning(tokenData);
    expect(tokenData[attr]).toBe('123-eherkenning-321');
  });

  test('getAuth.digid', async () => {
    // const cookieValue = generateDevSessionCookieValue('digid', '000-digid-999');
    const cookieValue =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjUwNjE5ODQ1LCJ1YXQiOjE2NTA2MTk4NDUsImV4cCI6MTY1MDYyMDc0NX0..HUllPK31lXj_KBII.BqZ5b-8qiL8CYsV33qbiS2gBYJFvSOyshlKrWOQDNzXKAEf2Y3BtE-NOcJ8atUqIFSjmMaN-ZTUp7cXzpO3_i1RxBKUB99on7hVO3rinLk8gMbVGgNOE5PgTjzgQQ2gJTdJtssMR_uIKtytVOOF0tlQzaXh0bq-WydAyuHPV3xEDoyt3VrPR53qTjotM52u3jCDV39C4zKXNz9fS_eqHqiVMefxpgUtJNnKsIGiWRRYcIvAO3xFKBY_IA2Jv53gt0x7-sQ7lm5SRSe1WcsmwBBzAf3pYqqnwXtH1Y6RQZgtfWvTFypUFBCMoZ0i8j5JsTNRaCKuJxo3m5qbs8UfKL9oD7i41GkEI4GwFSQ6wnGqptlOwFNjIYt8IFHiTqJ6AIu3WAE_Z-WZ4MjEcLYZ_sTGHB_RfVx629U_fok9Uq0B7ZYFk_8btl3kPvQWDHbmhgxtXOddwHKBGlFEJJiNuPo7zYt3brKGJidZhhm8grwx_oy5Tpqtw_p1CBJyI-T6A-vo__iUuaxhhzLd_mcDa5Oq6kxYoTT-jkn1BK_N15rVE1FRsg3TU4fNZehKZ6CsdXjw7zxfhVUslidyesUP13T6WLAYwfDwM-4r4OAKtqj-ZOnYFffWFoDzJykZiieqeLvYnVJXw6INMqCFCUhBMFMu1uw8ly3onFwc8fqR6so2rhHt4P88ZWOc.m-3fNCjKs5A2seItvXarHQ';

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
          "id": "000-digid-999",
          "profileType": "private",
          "sid": undefined,
        },
        "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjhZTjNwTkRVVXloby10UUIyNWFmcThES0NyeHQyVi1iUzZXOWdSazBjZ2sifQ.eyJzdWIiOiIwMDAtZGlnaWQtOTk5IiwiYXVkIjoidGVzdDIiLCJpYXQiOjE2NTA2MTk4NDV9.QvPW0CYDnHiX77VZVAUmXahrQeJW1D0IrR4GBTyayH83nv3xe-nHnUMsXIchuYozmDwnF36CBsd1mm-C16x0PK1QD6-Fu-2PAekMxKaWpRWcI6ICOgliEVyV6a2B_KI3ZHshjlXxLyh59VL_2NegKZBQWEvTsFazn0fzbPmoKM3SVj19IiLug8Us4n-jYvzD8kplGzvWVujl4-1VYeNvn0vSfBrcSdLtGPJI7fcJafPxJs6gY2mrpwyeQ3Pan7DEEhXOqucjs81x9cwRRf4_JbRkehLKCwxb4u1USSusqTEqGhGQm7JGJlD4nZIdScNG7Xyx9LQcGm0EfnrjXOTGcw",
      }
    `);

    expect((await decodeOIDCToken(result.token)).sub).toBe('000-digid-999');
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
    const cookieValue =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjUwNjE5ODQ1LCJ1YXQiOjE2NTA2MTk4NDUsImV4cCI6MTY1MDYyMDc0NX0..HUllPK31lXj_KBII.BqZ5b-8qiL8CYsV33qbiS2gBYJFvSOyshlKrWOQDNzXKAEf2Y3BtE-NOcJ8atUqIFSjmMaN-ZTUp7cXzpO3_i1RxBKUB99on7hVO3rinLk8gMbVGgNOE5PgTjzgQQ2gJTdJtssMR_uIKtytVOOF0tlQzaXh0bq-WydAyuHPV3xEDoyt3VrPR53qTjotM52u3jCDV39C4zKXNz9fS_eqHqiVMefxpgUtJNnKsIGiWRRYcIvAO3xFKBY_IA2Jv53gt0x7-sQ7lm5SRSe1WcsmwBBzAf3pYqqnwXtH1Y6RQZgtfWvTFypUFBCMoZ0i8j5JsTNRaCKuJxo3m5qbs8UfKL9oD7i41GkEI4GwFSQ6wnGqptlOwFNjIYt8IFHiTqJ6AIu3WAE_Z-WZ4MjEcLYZ_sTGHB_RfVx629U_fok9Uq0B7ZYFk_8btl3kPvQWDHbmhgxtXOddwHKBGlFEJJiNuPo7zYt3brKGJidZhhm8grwx_oy5Tpqtw_p1CBJyI-T6A-vo__iUuaxhhzLd_mcDa5Oq6kxYoTT-jkn1BK_N15rVE1FRsg3TU4fNZehKZ6CsdXjw7zxfhVUslidyesUP13T6WLAYwfDwM-4r4OAKtqj-ZOnYFffWFoDzJykZiieqeLvYnVJXw6INMqCFCUhBMFMu1uw8ly3onFwc8fqR6so2rhHt4P88ZWOc.m-3fNCjKs5A2seItvXarHQ';

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

  test('getOIDCToken.success', () => {
    const jweCookieString =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjUwNjIwMTMzLCJ1YXQiOjE2NTA2MjAxMzMsImV4cCI6MTY1MDYyMTAzM30..WJ7z2STbwGapmA7T.efCR3f_rH43BbxSzg7FhHE4zTpjOOA6TRG8KpKw7v_YsEJpmreToyymMPqpiavdHQWsYy13tdArS_B5C-rsTeXPwu53iHDj-RWJJKMt1ojipgB47tEW-T5VA1ZCE4mNRUxuYwHF8Q0S4vat4ZPT6M0Z_ktUznc7yaUtWyQOHsFSW39Ly9vF1cC4JydAfgDw8gosC-_DWSlWtLzSiTUSapH16VSznedPBISMxruukge2dLaCv-khKUKrtPUe3g8JSPO524iSphE47xFefzQNbrj-xQu9__uH31P_XKpxqoJ7O4PzQcgcq2EKxEqmvALRjh86pvSipSK5qVLv4wb1AHqnnd6O5fJkVT4n6W46W9g4B-4duYsFkM8OI6Z0YPUGhjx0DgurdVKLaBZM_gL782rEWDBjRAJD62Mn6MBxverk6Y8auFhontxUypKXh-2RmubkCgFJi473N3ozeeWGFAg550lNxIMY77YvGgKqPXXPUn9ye6l_8I1LpGEniyPnqZsJN8s0aeL2G6hcpChTgBErQ5liaf0XoyX3hEpi7cTNYwGxat1KuuVP5iQtdiWHxp6k-jhRxxLW96SYlpO56O5W3aMP5iJzPt-TVnwF2VnR-9AWzS_jtF3MSsvX35Pq_E-aRha7YHPeI9B4RmjDBx7GLAdYS5X7L33gR9hYZml30UJ0tpnJywvDT-UmBYrPzdns3U3ATiVrgPHgq3HR1n0HdALePCHzSd3sIriDZmKG2wWbwC51KzM5OG3vPmt19N75K.TJ6JzT9e18M_R9KgG9qzwg';

    expect(getOIDCToken(jweCookieString)).toMatchInlineSnapshot(
      `"eyJhbGciOiJSUzI1NiIsImtpZCI6IjhZTjNwTkRVVXloby10UUIyNWFmcThES0NyeHQyVi1iUzZXOWdSazBjZ2sifQ.eyJ1cm46ZXRvZWdhbmc6MS45OkVudGl0eUNvbmNlcm5lZElEOkt2S25yIjoiMTIzLWVoZXJrZW5uaW5nLTMyMSIsImF1ZCI6InRlc3QxIiwiaWF0IjoxNjUwNjIwMTMzfQ.qF2JLBflk_ajk11jiyrZqcLklB618aSVjnazeDAyljdRJMN_vUUqVZBNLgLI0CBZ_jTYQwbl2OQsizGIdp9_yUadu1FhU4xGHYFBXvtLmdUk049bLccJoFIFYrvJq9yMAUhhRrBLjUUPJN3M8KijF7JKG74QYwyKyL-MzvsvKOqQNLJKUgQ4wUbsY2n9SjPcWGtB6rvkHrbfGGZZmdozIKXWmsQMYP41cEL9E0S15iF78Zko8jaWiV9oUHNqy3CfyZJz-K0dCbPAhs73q_7NqZQF1UoRgw8cQCVpfami521KpS7U6PK6oYlrigF1sHhsN_MuCwVHeOtu_BvBo_IFMQ"`
    );
  });

  test('getOIDCToken.fail', () => {
    const jweCookieString =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjUwNjIyMTM2LCJ1YXQiOjE2NTA2MjIxMzYsImV4cCI6MTY1MDYyMzAzNn0..WJ7z2STbwGapmA7T.efCR3f_rH43BbxSzg7FhHE4zTpjOOA6TRG8KpKw7v_YsEJpmreToyymMPqpiavdHQWsYy13tdArS_B5C-rsTeXPwu53iHDj-RWJJKMt1ojipgB47tEW-T5VA1ZCE4mNRUxuYwHF8Q0S4vat4ZPT6M0Z_ktUznc7yaUtWyQOHsFSW39Ly9vF1cC4JydAfgDw8gosC-_DWSlWtLzSiTUSapH16VSznedPBISMxruukge2dLaCv-khKUKrtPUe3g8JSPO524iSphE47xFefzQNbrj-xQu9__uH31P_XKpxqoJ7O4PzQcgcq2EKxEqmvALRjh86pvSipSK5qVLv4wb1AHqnnd6O5fJkVT4n6W46W9g4B-4duYsFkM8OI6Z0YPUGhjx0DgurdVKLaBZM_gL782rEWDBjRAJD62Mn6MBxverk6Y8auFhontxUypKXh-2RmubkCgFJi473N3ozeeWGFAg550lNxIMY77YvGgKqPXXPUn9ye6l_8I1LpGEniyPnqZsJN8s0aeL2G6hcpChTgBErQ5liaf0XoyX3hEpi7cTNYwGxat1KuuVP5iQtdiWHxp6k-jhRxxLW96SYlpO56O5W3aMP5iJzPt-TVnwF2VnR-9AWzS_jtF3MSsvX35Pq_E-aRha7YHPeI9B4RmjDBx7GLAdYS5X7L33gR9hYZml30UJ0tpnJywvDT-UmBYrPzdns3U3ATiVrgPHgq3HR1n0HdALePCHzSd3sIriDZmKG2wWbwC51KzM5OG3vPmt19N75K.TJ6JzT9e18M_R9KgG9qzwg';

    let err;
    try {
      getOIDCToken(jweCookieString);
    } catch (error: any) {
      err = error.toString();
    }
    expect(err).toBe('JWEDecryptionFailed: decryption operation failed');
  });

  test('decodeOIDCToken', async () => {
    const jweCookieString =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjUwNjIwMTMzLCJ1YXQiOjE2NTA2MjAxMzMsImV4cCI6MTY1MDYyMTAzM30..WJ7z2STbwGapmA7T.efCR3f_rH43BbxSzg7FhHE4zTpjOOA6TRG8KpKw7v_YsEJpmreToyymMPqpiavdHQWsYy13tdArS_B5C-rsTeXPwu53iHDj-RWJJKMt1ojipgB47tEW-T5VA1ZCE4mNRUxuYwHF8Q0S4vat4ZPT6M0Z_ktUznc7yaUtWyQOHsFSW39Ly9vF1cC4JydAfgDw8gosC-_DWSlWtLzSiTUSapH16VSznedPBISMxruukge2dLaCv-khKUKrtPUe3g8JSPO524iSphE47xFefzQNbrj-xQu9__uH31P_XKpxqoJ7O4PzQcgcq2EKxEqmvALRjh86pvSipSK5qVLv4wb1AHqnnd6O5fJkVT4n6W46W9g4B-4duYsFkM8OI6Z0YPUGhjx0DgurdVKLaBZM_gL782rEWDBjRAJD62Mn6MBxverk6Y8auFhontxUypKXh-2RmubkCgFJi473N3ozeeWGFAg550lNxIMY77YvGgKqPXXPUn9ye6l_8I1LpGEniyPnqZsJN8s0aeL2G6hcpChTgBErQ5liaf0XoyX3hEpi7cTNYwGxat1KuuVP5iQtdiWHxp6k-jhRxxLW96SYlpO56O5W3aMP5iJzPt-TVnwF2VnR-9AWzS_jtF3MSsvX35Pq_E-aRha7YHPeI9B4RmjDBx7GLAdYS5X7L33gR9hYZml30UJ0tpnJywvDT-UmBYrPzdns3U3ATiVrgPHgq3HR1n0HdALePCHzSd3sIriDZmKG2wWbwC51KzM5OG3vPmt19N75K.TJ6JzT9e18M_R9KgG9qzwg';
    expect(await decodeOIDCToken(getOIDCToken(jweCookieString)))
      .toMatchInlineSnapshot(`
        {
          "aud": "test1",
          "iat": 1650620133,
          "urn:etoegang:1.9:EntityConcernedID:KvKnr": "123-eherkenning-321",
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
      } as Request;

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
      } as Request;

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
    } as Request;

    const res = {
      send: vi.fn().mockImplementation((responseContent: any) => {
        return responseContent;
      }),
      status: vi.fn(),
    } as unknown as Response;

    expect(
      await isAuthenticated()(req, res, vi.fn() as unknown as NextFunction)
    ).toStrictEqual({
      content: null,
      message: 'Unauthorized',
      status: 'ERROR',
    });

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('isAuthenticated.true', async () => {
    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: jweCookieString,
      },
    } as Request;

    const res = {
      send: vi.fn().mockImplementation((responseContent: any) => {
        return responseContent;
      }),
      status: vi.fn(),
    } as unknown as Response;

    const nextFn = vi.fn();

    await isAuthenticated()(req, res, nextFn);

    expect(nextFn).toHaveBeenCalled();
  });

  test('verifyAuthenticated', async () => {
    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]:
          'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjg5MjM4MzY3LCJ1YXQiOjE2ODkyMzgzNjcsImV4cCI6MTY4OTIzOTI2N30..RQW1R1ZKYLncXIVW.yoK7RQtRDjLQzz3Xyy244R5cZC8DnVm7m8Z6CuNmbgXxoI7ZaMEUaHRegeLqMrmhbAQOw3J59HRvf5y_-G_rN577N1qnnCt0VruL2ey0LL5Mp3ElVuXHLkWCdhU0DeZuHBcHcCPEj3_5HZTAeTBYS1HBNijsXON5_q8WeBJP_lshd-7ZbENcAjsZPeKs9SXZYbNaJPMcD4YY0IcXjI4A1Ue_RzU7I5hkYHC1yUWuiHw7b4yFCnclFZ0WpsS7tPGLdQ_tjXHSjR2Pj57J8_r_M5Y_nOajfYcDmc-J4V0vng13gocm99lac_UvjlLjkHwNQ802IQRPUTZVZKXYtcynq7o4-l2wFFp0KO9K8flEnUxAbYIZzdogRS66sS3u6IbhTkGMdGa_ZD8lNSpNo9iKR0jKRZSV1CQ2YmZ6VLYhekm7cAWa-HTBDd_yLOVVLUTjzMmp8_1Nyxlc0If3ZNtykPNcQltsWcP3HC5EE__Q-mzsc0SgiK5FfjHs9cbFpBglP_v41TRdNGJ9XPWexPRvwU4Alm_5gQVx6IVrNxBT_t8HZHKVNw5ZFTutNtpyK8sSa-bhURBB1PwcUwlp2Lxe2G0Aho1q5VuFrOZNNA3Ok_KkQXBVHNV86dxOFlurh6AWsKMQ6-Apq5nHHXvmhn1jOSCpNGt2nCekq6D_nEIGCnwWMq2vJw.3emPjZyYwAvDkOR_Pyevog',
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
    ////
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

    ////
    const req2 = jsonCopy(req);
    bffApi.get('/oidc/userinfo').times(1).reply(200, config.DEV_JWT);
    req2.oidc.isAuthenticated = vi.fn().mockReturnValueOnce(true);
    req2.cookies = {};
    expect(await verify(req2, res)).toStrictEqual(responseUnauthorized);
  });
});
