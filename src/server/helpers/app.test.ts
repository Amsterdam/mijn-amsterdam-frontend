import express from 'express';
import { apiErrorResult } from '../../universal/helpers';
import * as config from '../config';
import {
  addServiceResultHandler,
  clearRequestCache,
  getAuth,
  getProfileType,
  queryParams,
  send404,
  sendMessage,
  requestID,
  getAuthProfile,
  TokenData,
  sendUnauthorized,
  getOIDCToken,
  decodeOIDCToken,
  isRelayAllowed,
  generateDevSessionCookieValue,
  combineCookieChunks,
  isSessionCookieName,
} from './app';
import { cache } from './source-api-request';
import nock from 'nock';
import { BFF_PORT } from '../config';

const { oidcConfigDigid, oidcConfigEherkenning, OIDC_SESSION_COOKIE_NAME } =
  config;

describe('server/helpers/app', () => {
  const digidClientId = oidcConfigDigid.clientID;
  const eherkenningClientId = oidcConfigEherkenning.clientID;
  const secret = config.OIDC_COOKIE_ENCRYPTION_KEY;

  beforeAll(() => {
    oidcConfigEherkenning.clientID = 'test1';
    oidcConfigDigid.clientID = 'test2';
    (config.OIDC_COOKIE_ENCRYPTION_KEY as any) = '123123123kjhkjhsdkjfhsd';
  });

  afterAll(() => {
    oidcConfigEherkenning.clientID = digidClientId;
    oidcConfigDigid.clientID = eherkenningClientId;
    (config.OIDC_COOKIE_ENCRYPTION_KEY as any) = secret;
  });

  test('getAuth.eherkenning', async () => {
    // const cookieValue = generateDevSessionCookieValue(
    //   'eherkenning',
    //   '123-eherkenning-321'
    // );

    const cookieValue =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjUwNjIwMTMzLCJ1YXQiOjE2NTA2MjAxMzMsImV4cCI6MTY1MDYyMTAzM30..WJ7z2STbwGapmA7T.efCR3f_rH43BbxSzg7FhHE4zTpjOOA6TRG8KpKw7v_YsEJpmreToyymMPqpiavdHQWsYy13tdArS_B5C-rsTeXPwu53iHDj-RWJJKMt1ojipgB47tEW-T5VA1ZCE4mNRUxuYwHF8Q0S4vat4ZPT6M0Z_ktUznc7yaUtWyQOHsFSW39Ly9vF1cC4JydAfgDw8gosC-_DWSlWtLzSiTUSapH16VSznedPBISMxruukge2dLaCv-khKUKrtPUe3g8JSPO524iSphE47xFefzQNbrj-xQu9__uH31P_XKpxqoJ7O4PzQcgcq2EKxEqmvALRjh86pvSipSK5qVLv4wb1AHqnnd6O5fJkVT4n6W46W9g4B-4duYsFkM8OI6Z0YPUGhjx0DgurdVKLaBZM_gL782rEWDBjRAJD62Mn6MBxverk6Y8auFhontxUypKXh-2RmubkCgFJi473N3ozeeWGFAg550lNxIMY77YvGgKqPXXPUn9ye6l_8I1LpGEniyPnqZsJN8s0aeL2G6hcpChTgBErQ5liaf0XoyX3hEpi7cTNYwGxat1KuuVP5iQtdiWHxp6k-jhRxxLW96SYlpO56O5W3aMP5iJzPt-TVnwF2VnR-9AWzS_jtF3MSsvX35Pq_E-aRha7YHPeI9B4RmjDBx7GLAdYS5X7L33gR9hYZml30UJ0tpnJywvDT-UmBYrPzdns3U3ATiVrgPHgq3HR1n0HdALePCHzSd3sIriDZmKG2wWbwC51KzM5OG3vPmt19N75K.TJ6JzT9e18M_R9KgG9qzwg';

    const req = {
      cookies: {
        [OIDC_SESSION_COOKIE_NAME]: cookieValue,
      },
    } as unknown as typeof express.request;

    const result = await getAuth(req);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "profile": Object {
          "authMethod": "eherkenning",
          "profileType": "commercial",
        },
        "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjhZTjNwTkRVVXloby10UUIyNWFmcThES0NyeHQyVi1iUzZXOWdSazBjZ2sifQ.eyJ1cm46ZXRvZWdhbmc6MS45OkVudGl0eUNvbmNlcm5lZElEOkt2S25yIjoiMTIzLWVoZXJrZW5uaW5nLTMyMSIsImF1ZCI6InRlc3QxIiwiaWF0IjoxNjUwNjIwMTMzfQ.qF2JLBflk_ajk11jiyrZqcLklB618aSVjnazeDAyljdRJMN_vUUqVZBNLgLI0CBZ_jTYQwbl2OQsizGIdp9_yUadu1FhU4xGHYFBXvtLmdUk049bLccJoFIFYrvJq9yMAUhhRrBLjUUPJN3M8KijF7JKG74QYwyKyL-MzvsvKOqQNLJKUgQ4wUbsY2n9SjPcWGtB6rvkHrbfGGZZmdozIKXWmsQMYP41cEL9E0S15iF78Zko8jaWiV9oUHNqy3CfyZJz-K0dCbPAhs73q_7NqZQF1UoRgw8cQCVpfami521KpS7U6PK6oYlrigF1sHhsN_MuCwVHeOtu_BvBo_IFMQ",
      }
    `);

    expect(
      (await decodeOIDCToken(result.token))[
        config.OIDC_TOKEN_ID_ATTRIBUTE.eherkenning
      ]
    ).toBe('123-eherkenning-321');
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
      Object {
        "profile": Object {
          "authMethod": "digid",
          "profileType": "private",
        },
        "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjhZTjNwTkRVVXloby10UUIyNWFmcThES0NyeHQyVi1iUzZXOWdSazBjZ2sifQ.eyJzdWIiOiIwMDAtZGlnaWQtOTk5IiwiYXVkIjoidGVzdDIiLCJpYXQiOjE2NTA2MTk4NDV9.QvPW0CYDnHiX77VZVAUmXahrQeJW1D0IrR4GBTyayH83nv3xe-nHnUMsXIchuYozmDwnF36CBsd1mm-C16x0PK1QD6-Fu-2PAekMxKaWpRWcI6ICOgliEVyV6a2B_KI3ZHshjlXxLyh59VL_2NegKZBQWEvTsFazn0fzbPmoKM3SVj19IiLug8Us4n-jYvzD8kplGzvWVujl4-1VYeNvn0vSfBrcSdLtGPJI7fcJafPxJs6gY2mrpwyeQ3Pan7DEEhXOqucjs81x9cwRRf4_JbRkehLKCwxb4u1USSusqTEqGhGQm7JGJlD4nZIdScNG7Xyx9LQcGm0EfnrjXOTGcw",
      }
    `);

    expect((await decodeOIDCToken(result.token)).sub).toBe('000-digid-999');
  });

  test('getAuthProfile', () => {
    {
      const profile = getAuthProfile({
        aud: 'test1',
      } as TokenData);

      expect(profile).toStrictEqual({
        authMethod: 'eherkenning',
        profileType: 'commercial',
      });
    }

    {
      const profile = getAuthProfile({
        aud: 'test2',
      } as TokenData);

      expect(profile).toStrictEqual({
        authMethod: 'digid',
        profileType: 'private',
      });
    }

    {
      const profile = getAuthProfile({
        aud: 'test_x',
      } as TokenData);

      expect(profile).toStrictEqual({
        authMethod: 'digid',
        profileType: 'private',
      });
    }
  });

  test('requestID', () => {
    const mockNext = jest.fn();

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
      status: jest.fn(),
      send: jest.fn(),
    };

    send404(mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.send).toHaveBeenCalledWith(
      apiErrorResult('Not Found', null)
    );
  });

  test('sendUnauthorized', () => {
    const mockRes = {
      status: jest.fn(),
      send: jest.fn(),
    };

    sendUnauthorized(mockRes as any);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.send).toHaveBeenCalledWith(
      apiErrorResult('Unauthorized', null)
    );
  });

  test('clearRequestCache', () => {
    const requestID = '11223300xx';
    const nextMock = jest.fn();
    cache.put(requestID, { foo: 'bar' });

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });

    clearRequestCache({} as any, { locals: { requestID } } as any, nextMock);

    expect(cache.get(requestID)).toBe(null);
    expect(cache.keys()).toEqual([]);
    expect(nextMock).toBeCalledTimes(1);
  });

  test('clearRequestCache.unknown.key', () => {
    const requestID = '11223300xx';
    const nextMock = jest.fn();
    cache.put(requestID, { foo: 'bar' });

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });

    clearRequestCache(
      {} as any,
      { locals: { requestID: 'some_other_key' } } as any,
      nextMock
    );

    expect(cache.get(requestID)).toEqual({ foo: 'bar' });
    expect(cache.keys()).toEqual([requestID]);
    expect(nextMock).toBeCalledTimes(1);
  });

  test('sendMessage', () => {
    const res = {
      write: jest.fn(),
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
      write: jest.fn(),
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

  test('getProfileType', () => {
    {
      const result = getProfileType({ query: {} } as any);
      expect(result).toBe('private');
    }
    {
      const result = getProfileType({
        query: { profileType: 'commercial' },
      } as any);
      expect(result).toBe('commercial');
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
      Object {
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
      'appSession.0': 'xxxx',
      somethingelse: 'foobar',
      'appSession.1': 'yyyy',
      'appSession.2': 'zzzz',
    };
    expect(combineCookieChunks(cookies)).toBe('xxxxyyyyzzzz');
  });

  test('isSessionCookieName', () => {
    let name = 'appSession.0';
    expect(isSessionCookieName(name)).toBe(true);
    name = 'appSession';
    expect(isSessionCookieName(name)).toBe(true);
    name = 'appsession';
    expect(isSessionCookieName(name)).toBe(false);
  });
});
