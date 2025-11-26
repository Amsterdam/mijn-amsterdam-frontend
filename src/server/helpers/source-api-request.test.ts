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

import { encrypt } from './encrypt-decrypt';
import {
  createSessionBasedCacheKey,
  getRequestConfigCacheKey,
} from './source-api-helpers';
import {
  axiosRequest,
  findApiByRequestUrl,
  forTesting,
  requestData,
} from './source-api-request';
import { remoteApiHost } from '../../testing/setup';
import { getAuthProfileAndToken, remoteApi } from '../../testing/utils';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccessResult,
} from '../../universal/helpers/api';
import type { AuthProfile } from '../auth/auth-types';
import {
  ApiUrlEntries,
  DEFAULT_REQUEST_CACHE_TTL_MS,
  FORCE_RENEW_CACHE_TTL_MS,
} from '../config/source-api';
import { captureException } from '../services/monitoring';

const mocks = vi.hoisted(() => {
  return {
    cacheEnabled: true,
  };
});

vi.mock('../config/app.ts', async (importOrigModule) => {
  return {
    ...(await importOrigModule()),
    get BFF_REQUEST_CACHE_ENABLED() {
      return mocks.cacheEnabled;
    },
  };
});

vi.mock('../services/monitoring');

describe('source-api-request caching', () => {
  function fetchThings(
    sessionID: AuthProfile['sid'],
    cacheKey?: string,
    forceRenew = false
  ) {
    return requestData<[string, string]>({
      url: `${remoteApiHost}/1`,
      method: 'get',
      transformResponse: (data) => {
        // Add encrypted sessionID to response for testing purposes.
        // This generates a different response payload every time.
        const [value] = encrypt(sessionID);
        return [data, value];
      },
      cacheKey_UNSAFE: cacheKey,
      cacheTimeout: forceRenew
        ? FORCE_RENEW_CACHE_TTL_MS
        : DEFAULT_REQUEST_CACHE_TTL_MS,
      enableCache: true,
    });
  }

  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('Correct: Uses cache with same sessionID within timeout period.', async () => {
    remoteApi.get('/1').reply(200, '"foo"');
    remoteApi.get('/1').reply(200, '"notfoo"');

    const SESSION_ID_1 = '123';

    const rs1 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things')
    );
    const rs2 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things')
    );

    expect(rs2.content?.[1]).toBe(rs1.content?.[1]);

    // Expire the cache
    vi.runAllTimers();

    const rs3 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things')
    );

    // Because the cache expired, we should get a new value for the encrypted sessionID.
    expect(rs2.content?.[1]).not.toBe(rs3.content?.[1]);
    expect(rs2.content?.[0]).not.toBe(rs3.content?.[0]);
    expect(rs3.content?.[0]).toBe('notfoo');
  });

  test('Correct: Forces to renew cache if cacheTimeout set to 0.', async () => {
    remoteApi.get('/1').reply(200, '"foo"');
    remoteApi.get('/1').reply(200, '"releasefoo"');
    remoteApi.get('/1').reply(200, '"renewedfoo"');

    const SESSION_ID_1 = '123';

    const rs1 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things')
    );
    const rs2 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things')
    );

    expect(rs1.content?.[0]).toBe('foo');
    expect(rs2.content?.[1]).toBe(rs1.content?.[1]);

    const DO_FORCE_RENEW = true;

    const rs3 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things'),
      DO_FORCE_RENEW
    );

    vi.advanceTimersByTime(FORCE_RENEW_CACHE_TTL_MS);

    const rs4 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things')
    );

    expect(rs3.content?.[0]).toBe('releasefoo');
    expect(rs4.content?.[0]).toBe('renewedfoo');
  });

  test("Correct: Doesn't use cache with different sessionID", async () => {
    remoteApi.get('/1').times(2).reply(200, '"foo"');

    const SESSION_ID_1 = '123';
    const SESSION_ID_2 = '321';

    const rs1 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things')
    );
    expect(rs1.content?.[0]).toEqual('foo');

    const rs2 = await fetchThings(
      SESSION_ID_2,
      createSessionBasedCacheKey(SESSION_ID_2, 'things')
    );
    expect(rs2.content?.[0]).toEqual('foo');
    expect(rs2.content?.[1]).not.toBe(rs1.content?.[1]);
  });

  test('Warning!: Use cachekey_UNSAFE instead. Mistakenly caches transformed response with previously encrypted sessionID', async () => {
    remoteApi.get('/1').reply(200, '"foo"');

    const SESSION_ID_1 = '123';
    const SESSION_ID_2 = '321';

    const rs1 = await fetchThings(SESSION_ID_1);
    const rs1b = await fetchThings(SESSION_ID_1);

    expect(rs1b.content?.[1]).toBe(rs1.content?.[1]);

    // User initiates a new session.
    const rs2 = await fetchThings(SESSION_ID_2);
    expect(rs2.content?.[0]).toEqual('foo');

    // Still has the old sessionID because the cacheKey is the same.
    expect(rs2.content?.[1]).toBe(rs1.content?.[1]);
  });
});

describe('requestData', () => {
  const { cache } = forTesting;
  const DUMMY_RESPONSE = { foo: 'bar' };

  const DUMMY_URL = `${remoteApiHost}/1`;
  const DUMMY_ROUTE_2 = '/2';
  const DUMMY_URL_2 = `${remoteApiHost}${DUMMY_ROUTE_2}`;

  const AUTH_PROFILE_AND_TOKEN = getAuthProfileAndToken();

  const CACHE_KEY_1 = `get-${DUMMY_URL}-no-params-no-data-no-headers`;

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
      AUTH_PROFILE_AND_TOKEN
    );

    expect(rs).toStrictEqual(apiSuccessResult(DUMMY_RESPONSE));
  });

  it('Caches the response: Valid JSON', async () => {
    remoteApi.get('/1').reply(200, '"whoa"');

    await requestData(
      {
        url: DUMMY_URL,
      },
      AUTH_PROFILE_AND_TOKEN
    );

    const response2 = await requestData(
      {
        url: DUMMY_URL,
      },
      AUTH_PROFILE_AND_TOKEN
    );

    expect(await cache.get(CACHE_KEY_1).promise).toStrictEqual(response2);

    // Should clear the cache timeout
    vi.runAllTimers();

    expect(cache.get(CACHE_KEY_1)).toBe(null);
  });

  it('Does not cache the response: BAD JSON', async () => {
    remoteApi.get('/1').reply(200, 'whoa');

    await requestData(
      {
        url: DUMMY_URL,
      },
      AUTH_PROFILE_AND_TOKEN
    );

    expect(await cache.get(CACHE_KEY_1)).toBe(null);
  });

  it('Does not cache the response', async () => {
    mocks.cacheEnabled = false;

    remoteApi.get('/1').reply(200, 'whoa');

    await requestData(
      {
        url: DUMMY_URL,
      },
      AUTH_PROFILE_AND_TOKEN
    );

    expect(cache.get(CACHE_KEY_1)).toBe(null);

    mocks.cacheEnabled = true;
  });

  it('A requests is postponed', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
        postponeFetch: true,
      },
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
      AUTH_PROFILE_AND_TOKEN
    );

    expect(rs).toStrictEqual(apiErrorResult('Network Error', null));
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
      AUTH_PROFILE_AND_TOKEN
    );

    expect(axiosRequestSpy.mock.calls[0][0].passthroughOIDCToken).toEqual(true);
    expect(axiosRequestSpy.mock.calls[0][0].headers).toStrictEqual({
      Authorization: `Bearer ${AUTH_PROFILE_AND_TOKEN.token}`,
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
      AUTH_PROFILE_AND_TOKEN
    );

    expect(axiosRequestSpy.mock.calls[0][0].passthroughOIDCToken).toEqual(true);
    expect(axiosRequestSpy.mock.calls[0][0].headers).toStrictEqual({
      Authorization: `Bearer ababababab`,
    });
  });

  test('getRequestConfigCacheKey', () => {
    expect(
      getRequestConfigCacheKey({
        method: 'post',
        data: { foo: 'bar' },
      })
    ).toStrictEqual('post--no-params-{"foo":"bar"}-no-headers');

    expect(
      getRequestConfigCacheKey({
        method: 'get',
        url: 'http://foo',
        params: { foo: 'bar' },
      })
    ).toStrictEqual('get-http://foo-{"foo":"bar"}-no-data-no-headers');

    expect(
      getRequestConfigCacheKey({
        method: 'get',
        url: 'http://foo',
      })
    ).toStrictEqual('get-http://foo-no-params-no-data-no-headers');

    expect(
      getRequestConfigCacheKey({
        method: 'get',
        url: 'http://foo',
        cacheTimeout: 1000,
      })
    ).toStrictEqual('get-http://foo-no-params-no-data-no-headers');

    expect(
      getRequestConfigCacheKey({
        method: 'get',
        url: 'http://foo',
        headers: {
          Authorization: 'Bearer 123123123123',
        },
      })
    ).toStrictEqual(
      'get-http://foo-no-params-no-data-{"Authorization":"Bearer 123123123123"}'
    );
  });
});
