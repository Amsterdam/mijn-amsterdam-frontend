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

vi.mock('../config/app.ts', async (importOrigModule: () => Promise<[]>) => {
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
    cacheTimeout: number = DEFAULT_REQUEST_CACHE_TTL_MS
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
      cacheTimeout: cacheTimeout,
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

  test('Correct: Forces to renew cache if cacheTimeout set to FORCE_RENEW_CACHE_TTL_MS.', async () => {
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

    const [responseValue1, encryptedSessionID1] = rs1.content ?? [];
    const [responseValue2, encryptedSessionID2] = rs2.content ?? [];

    expect(responseValue1).toBe('foo');
    expect(responseValue2).toBe(responseValue1);

    // Ah yes, the encrpted sessionID is the same as well. Caching works!
    expect(encryptedSessionID2).toBe(encryptedSessionID1);

    const rs3 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things'),
      FORCE_RENEW_CACHE_TTL_MS
    );

    // If we request again within the FORCE_RENEW_CACHE_TTL_MS period, we should get the same cached value.
    // In other words, it takes a little time for the cache to expire.
    const rs4 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things')
    );

    vi.advanceTimersByTime(FORCE_RENEW_CACHE_TTL_MS);

    const rs5 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things')
    );

    const [responseValue3, encryptedSessionID3] = rs3.content ?? [];
    const [responseValue4, encryptedSessionID4] = rs4.content ?? [];
    const [responseValue5, encryptedSessionID5] = rs5.content ?? [];

    expect(responseValue3).toBe('releasefoo');
    expect(responseValue4).toBe(responseValue3);
    expect(encryptedSessionID4).toBe(encryptedSessionID3);
    expect(responseValue5).toBe('renewedfoo');
    expect(encryptedSessionID5).not.toBe(encryptedSessionID3);
  });

  test('Does not use cache with values <= 0', async () => {
    const SESSION_ID_1 = '123';

    remoteApi.get('/1').reply(200, '"foo"');
    remoteApi.get('/1').reply(200, '"foo-2"');

    const rs = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things'),
      0
    );
    const rs2 = await fetchThings(
      SESSION_ID_1,
      createSessionBasedCacheKey(SESSION_ID_1, 'things'),
      0
    );

    expect(rs.content?.[0]).toBe('foo');
    expect(rs2.content?.[0]).toBe('foo-2');
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
        'BENK_BRP',
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
    expect(findApiByRequestUrl(entries, 'http://get/bar')).toBe('BENK_BRP');
    expect(findApiByRequestUrl(entries, 'http://get/bar/commercial')).toBe(
      'BENK_BRP'
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
