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
} from './app';
import { cache } from './source-api-request';

const { oidcConfigDigid, oidcConfigEherkenning, OIDC_SESSION_COOKIE_NAME } =
  config;

describe('server/helpers/app', () => {
  const digidClientId = oidcConfigDigid.clientID;
  const eherkenningClientId = oidcConfigEherkenning.clientID;
  const secret = config.OIDC_SECRET;

  beforeAll(() => {
    oidcConfigEherkenning.clientID = 'test1';
    oidcConfigDigid.clientID = 'test2';
    (config.OIDC_SECRET as any) = '123123123kjhkjhsdkjfhsd';
  });

  afterAll(() => {
    oidcConfigEherkenning.clientID = digidClientId;
    oidcConfigDigid.clientID = eherkenningClientId;
    (config.OIDC_SECRET as any) = secret;
  });

  test('getAuth.eherkenning', async () => {
    const cookieValue =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjQ4NjMxOTc2LCJ1YXQiOjE2NDg2MzE5NzYsImV4cCI6MTY0ODYzMjg3Nn0..jU0F-zWKDX9Q2xHK.41K_wP5MaRvcWIYExcx-tyRI6w9iLQWkbX9VOsjZ-9R02qVt0A4sONnjI1KIzLtIwkbaQnsst-qbx8xcEmYmvFGb8JmvKafRLZu1aoux0WhG5uQSeys1ZEcXpvGE66VkG8qMfFTzt_dL5Hc4StCrrX-K8_JDqCHQMNLqPH55CfM6RCLGTJApUftWKcEt1qYPdj9c.idKSQMRtqRlPepcZxY7yaw';

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
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzMjFCU045ODciLCJhdWQiOiJ0ZXN0MSIsImlhdCI6MTY0ODYzMTk3Nn0.75OPUMviZRC8TyvTO4cOujujOMi3v3ey_M9imIqG8Tk",
      }
    `);
  });

  test('getAuth.digid', async () => {
    const cookieValue =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjQ4NjMyMjA1LCJ1YXQiOjE2NDg2MzIyMDUsImV4cCI6MTY0ODYzMzEwNX0..bZ-oiaEqylULXoTF.Z2Cvwe0Mrss_vZkwGnfPBWH96keDt8kkMPJDclLD7ZsE_tu__Muu98knSB-WkHnCBzv7eTQ92urPWH3G8FQrkgznfzTuEIdazWQTtO1XoNwojcJMVErFLLurNoV9CGhLShCoy4lWjhmsE2KQAFrIQkl83lLkK3Ed0Ki_7onyrvwzqUimYpIgqcdxX3YwuTyyfmeQ.bVeqiqk4GrQ8CuVjfyyCxg';

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
        "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzMjFCU045ODciLCJhdWQiOiJ0ZXN0MiIsImlhdCI6MTY0ODYzMjIwNX0._dE-fgIsEj7eOje55lfOBPZGio8h7TaPykfJpRoo_M4",
      }
    `);
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
    const token =
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaWF0IjoxNjQ4NjMyMjA1LCJ1YXQiOjE2NDg2MzIyMDUsImV4cCI6MTY0ODYzMzEwNX0..bZ-oiaEqylULXoTF.Z2Cvwe0Mrss_vZkwGnfPBWH96keDt8kkMPJDclLD7ZsE_tu__Muu98knSB-WkHnCBzv7eTQ92urPWH3G8FQrkgznfzTuEIdazWQTtO1XoNwojcJMVErFLLurNoV9CGhLShCoy4lWjhmsE2KQAFrIQkl83lLkK3Ed0Ki_7onyrvwzqUimYpIgqcdxX3YwuTyyfmeQ.bVeqiqk4GrQ8CuVjfyyCxg';

    expect(getOIDCToken(token)).toMatchInlineSnapshot(
      `"eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzMjFCU045ODciLCJhdWQiOiJ0ZXN0MiIsImlhdCI6MTY0ODYzMjIwNX0._dE-fgIsEj7eOje55lfOBPZGio8h7TaPykfJpRoo_M4"`
    );
  });

  test('getOIDCToken.fail', () => {
    const token =
      'eyJhbGciOiJkaXIiLC..bZ-oiaEqylULXoTF.Z2Cvwe0Mrss_vZkwGnfPBWH96keDt8kkMPJDclLD7ZsE_tu__Muu98knSB-WkHnCBzv7eTQ92urPWH3G8FQrkgznfzTuEIdazWQTtO1XoNwojcJMVErFLLurNoV9CGhLShCoy4lWjhmsE2KQAFrIQkl83lLkK3Ed0Ki_7onyrvwzqUimYpIgqcdxX3YwuTyyfmeQ.bVeqiqk4GrQ8CuVjfyyCxg';

    try {
      getOIDCToken(token);
    } catch (error: any) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(error.toString()).toBe(
        'JWEInvalid: could not parse JWE protected header'
      );
    }
  });

  test('decodeOIDCToken', () => {
    expect(
      decodeOIDCToken(
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIzMjFCU045ODciLCJhdWQiOiJ0ZXN0MiIsImlhdCI6MTY0ODYzMjIwNX0._dE-fgIsEj7eOje55lfOBPZGio8h7TaPykfJpRoo_M4'
      )
    ).toMatchInlineSnapshot(`
      Object {
        "aud": "test2",
        "iat": 1648632205,
        "sub": "321BSN987",
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
});
