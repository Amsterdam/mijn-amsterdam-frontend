import {
  Mock,
  MockInstance,
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  test,
  vi,
} from 'vitest';

import {
  axiosRequest,
  cache,
  findApiByRequestUrl,
  getRequestConfigCacheKey,
  requestData,
} from './source-api-request';
import { remoteApiHost } from '../../testing/setup';
import { remoteApi } from '../../testing/utils';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../auth/auth-types';
import { ApiUrlEntries } from '../config/source-api';
import { captureException } from '../services/monitoring';
const mocks = vi.hoisted(() => {
  return {
    cacheEnabled: true,
  };
});

vi.mock('../config/app', async (importOrigModule) => {
  return {
    ...((await importOrigModule()) as object),
    get BFF_REQUEST_CACHE_ENABLED() {
      return mocks.cacheEnabled;
    },
  };
});

vi.mock('../services/monitoring');

describe('requestData.ts', () => {
  const DUMMY_RESPONSE = { foo: 'bar' };
  const DUMMY_RESPONSE_2 = { foo: 'baz' };

  const DUMMY_URL = `${remoteApiHost}/1`;
  const DUMMY_ROUTE_2 = '/2';
  const DUMMY_URL_2 = `${remoteApiHost}${DUMMY_ROUTE_2}`;

  const SESS_ID_1 = 'x1';
  const SESS_ID_2 = 'y2';
  const TOKEN = 'xxxxx';
  const AUTH_PROFILE_AND_TOKEN: AuthProfileAndToken = {
    profile: {
      authMethod: 'digid',
      profileType: 'private',
      id: 'bsnxxxx',
      sid: '',
    },
    token: TOKEN,
  };

  const CACHE_KEY_1 = `${SESS_ID_1}-get-${DUMMY_URL}-no-params-no-data-no-headers`;
  const CACHE_KEY_2 = `${SESS_ID_2}-get-${DUMMY_URL}-no-params-no-data-no-headers`;

  let axiosRequestSpy: MockInstance;

  beforeAll(() => {
    vi.useFakeTimers();
  });

  beforeEach(() => {
    axiosRequestSpy = vi.spyOn(axiosRequest, 'request');
  });

  afterEach(() => {
    cache.clear();
    axiosRequestSpy.mockRestore();
    (captureException as Mock).mockClear();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('A requests succeeds', async () => {
    remoteApi.get('/1').reply(200, DUMMY_RESPONSE);

    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(rs).toStrictEqual(apiSuccessResult(DUMMY_RESPONSE));
  });

  it('Should make request with passthrough headers', async () => {
    remoteApi.get('/1').reply(200, DUMMY_RESPONSE_2);

    await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(axiosRequestSpy).toHaveBeenCalledTimes(1);
    // expect(axiosRequestSpy.mock.calls[0][0].headers).toEqual(HEADERS_FILTERED);
  });

  it('Caches the response: Valid JSON', async () => {
    remoteApi.get('/1').reply(200, '"whoa"');

    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(await cache.get(CACHE_KEY_1).promise).toStrictEqual(rs);

    // Should clear the cache timeout
    vi.runAllTimers();

    expect(cache.get(CACHE_KEY_1)).toBe(null);
  });

  it('Does not cache the response: BAD JSON', async () => {
    remoteApi.get('/1').reply(200, 'whoa');

    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(await cache.get(CACHE_KEY_1)).toBe(null);
  });

  it('Does not cache the response', async () => {
    mocks.cacheEnabled = false;

    remoteApi.get('/1').reply(200, 'whoa');

    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(cache.get(CACHE_KEY_1)).toBe(null);

    mocks.cacheEnabled = true;
  });

  it('Caches the response per session id', async () => {
    remoteApi.get('/1').reply(200, DUMMY_RESPONSE);
    remoteApi.get('/1').reply(200, DUMMY_RESPONSE_2);

    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    const rs2 = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_2,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(await cache.get(CACHE_KEY_1).promise).toStrictEqual(
      apiSuccessResult(DUMMY_RESPONSE)
    );
    expect(await cache.get(CACHE_KEY_1).promise).toStrictEqual(rs);
    expect(await cache.get(CACHE_KEY_2).promise).toStrictEqual(
      apiSuccessResult(DUMMY_RESPONSE_2)
    );
    expect(await cache.get(CACHE_KEY_2).promise).toStrictEqual(rs2);

    expect(cache.keys()[0]).toBe(CACHE_KEY_1);
    expect(cache.keys()[1]).toBe(CACHE_KEY_2);

    vi.runAllTimers();

    expect(cache.keys().length).toBe(0);
  });

  it('A requests is postponed', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
        postponeFetch: true,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(axiosRequestSpy).toHaveBeenCalledTimes(0);
    expect(rs).toStrictEqual(apiPostponeResult(null));
  });

  it('A requests responds with error', async () => {
    remoteApi.get(DUMMY_ROUTE_2).replyWithError('Network Error');

    const rs = await requestData(
      {
        url: DUMMY_URL_2,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(rs).toStrictEqual(apiErrorResult('Network Error', null));
  });

  test('Sends non AxiosErrors to telemetry', async () => {
    remoteApi.get(DUMMY_ROUTE_2).replyWithError('Network Error');

    await requestData(
      {
        url: DUMMY_URL_2,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );
    expect(captureException).not.toHaveBeenCalled();

    await requestData(
      {
        request: () => {
          throw new Error('This should be send to telemetry!');
        },
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );
    expect(captureException).toHaveBeenCalled();
  });

  test('Find corresponding api', () => {
    const entries: ApiUrlEntries = [
      ['WPI_AANVRAGEN', 'http://get/foo'],
      [
        'BRP',
        { private: 'http://get/bar', commercial: 'https://get/bar/commercial' },
      ],
      [
        'KREFIA',
        {
          private: 'http://get/world',
          commercial: 'https://get/world/commercial',
        },
      ],
    ];

    expect(findApiByRequestUrl(entries, 'http://get/foo')).toBe(
      'WPI_AANVRAGEN'
    );
    expect(findApiByRequestUrl(entries, 'http://get/bar')).toBe('BRP');
    expect(findApiByRequestUrl(entries, 'http://get/bar/commercial')).toBe(
      'BRP'
    );
    expect(findApiByRequestUrl(entries, 'http://get/some/thing')).toBe(
      'unknown'
    );
    expect(findApiByRequestUrl(entries, 'http://get')).toBe('unknown');
  });

  test('By default Bearer token is not passed', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(axiosRequestSpy.mock.calls[0][0].passthroughOIDCToken).toEqual(
      false
    );
    expect(axiosRequestSpy.mock.calls[0][0].headers).toBeUndefined();
  });

  test('OIDC Bearer token _is_ passed', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
        passthroughOIDCToken: true,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(axiosRequestSpy.mock.calls[0][0].passthroughOIDCToken).toEqual(true);
    expect(axiosRequestSpy.mock.calls[0][0].headers).toStrictEqual({
      Authorization: `Bearer ${TOKEN}`,
    });
  });

  test('OIDC Bearer token _is_ passed _and_ overridden', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
        passthroughOIDCToken: true,
        headers: {
          Authorization: 'Bearer ababababab',
        },
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(axiosRequestSpy.mock.calls[0][0].passthroughOIDCToken).toEqual(true);
    expect(axiosRequestSpy.mock.calls[0][0].headers).toStrictEqual({
      Authorization: `Bearer ababababab`,
    });
  });

  // test('BFF_REQUEST_CACHE_ENABLED', async () => {
  //   mocks.cacheEnabled = true;
  // });

  test('getRequestConfigCacheKey', () => {
    expect(
      getRequestConfigCacheKey('x1', {
        method: 'post',
        data: { foo: 'bar' },
      })
    ).toMatchInlineSnapshot(`"x1-post--no-params-{"foo":"bar"}-no-headers"`);

    expect(
      getRequestConfigCacheKey('x2', {
        method: 'get',
        url: 'http://foo',
        params: { foo: 'bar' },
      })
    ).toMatchInlineSnapshot(
      `"x2-get-http://foo-{"foo":"bar"}-no-data-no-headers"`
    );

    expect(
      getRequestConfigCacheKey('x3', {
        method: 'get',
        url: 'http://foo',
      })
    ).toMatchInlineSnapshot(`"x3-get-http://foo-no-params-no-data-no-headers"`);

    expect(
      getRequestConfigCacheKey('x4', {
        method: 'get',
        url: 'http://foo',
        headers: {
          Authorization: 'Bearer 123123123123',
        },
      })
    ).toMatchInlineSnapshot(
      `"x4-get-http://foo-no-params-no-data-{"Authorization":"Bearer 123123123123"}"`
    );
  });
});
