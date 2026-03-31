import type { Mock, MockInstance } from 'vitest';
import {
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

import { encrypt } from './encrypt-decrypt.ts';
import {
  createSessionBasedCacheKey,
  getRequestConfigCacheKey,
} from './source-api-helpers.ts';
import {
  axiosRequest,
  findApiByRequestUrl,
  forTesting,
  requestData,
} from './source-api-request.ts';
import { remoteApiHost } from '../../testing/setup.ts';
import { getAuthProfileAndToken, remoteApi } from '../../testing/utils.ts';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccessResult,
} from '../../universal/helpers/api.ts';
import type { AuthProfile } from '../auth/auth-types.ts';
import type { ApiUrlEntries } from '../config/source-api.ts';
import {
  DEFAULT_REQUEST_CACHE_TTL_MS,
  FORCE_RENEW_CACHE_TTL_MS,
} from '../config/source-api.ts';
import { captureException } from '../services/monitoring.ts';

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

vi.mock('../services/monitoring.ts');

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
      cacheTimeout,
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

  test('Correct: Does not cache the transformed response.', async () => {
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

    expect(rs2.content?.[1]).not.toBe(rs1.content?.[1]);

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
    const requestDataSpy = vi.spyOn(axiosRequest, 'request');
    const SESSION_ID_1 = '123';
    const sessionBasedCacheKey = createSessionBasedCacheKey(
      SESSION_ID_1,
      'things'
    );

    remoteApi.get('/1').reply(200, '"foo"');
    remoteApi.get('/1').reply(200, '"releasefoo"');
    remoteApi.get('/1').reply(200, '"renewedfoo"');

    const rs1 = await fetchThings(SESSION_ID_1, sessionBasedCacheKey);
    const rs2 = await fetchThings(SESSION_ID_1, sessionBasedCacheKey);

    const [responseValue1] = rs1.content ?? [];
    const [responseValue2] = rs2.content ?? [];

    expect(responseValue1).toBe('foo');
    expect(responseValue2).toBe(responseValue1);
    expect(requestDataSpy).toHaveBeenCalledTimes(1);

    // Now we release and renew the cache.
    const rs3 = await fetchThings(
      SESSION_ID_1,
      sessionBasedCacheKey,
      FORCE_RENEW_CACHE_TTL_MS
    );

    const [responseValue3] = rs3.content ?? [];
    expect(responseValue3).toBe('releasefoo');
    expect(requestDataSpy).toHaveBeenCalledTimes(2);

    // This should be the same as the previous response, because we forced to renew the cache, but the new request serves cached again.
    const rs4 = await fetchThings(SESSION_ID_1, sessionBasedCacheKey);

    const [responseValue4] = rs4.content ?? [];
    expect(responseValue4).toBe(responseValue3);
    expect(requestDataSpy).toHaveBeenCalledTimes(2);

    // Now we release the normal cache by expiring it, and the next request should trigger a new request to the remote API, which serves the new response.
    vi.advanceTimersByTime(DEFAULT_REQUEST_CACHE_TTL_MS);

    const rs5 = await fetchThings(SESSION_ID_1, sessionBasedCacheKey);

    expect(requestDataSpy).toHaveBeenCalledTimes(3);
    const [responseValue5] = rs5.content ?? [];
    expect(responseValue5).toBe('renewedfoo');

    requestDataSpy.mockRestore();
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

    expect(rs).toStrictEqual(apiErrorResult('Network Error', null, 500));
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

  test('OIDC Bearer token _is_ passed', async () => {
    await requestData(
      {
        url: DUMMY_URL,
        passthroughOIDCToken: true,
      },
      AUTH_PROFILE_AND_TOKEN
    );

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

    expect(axiosRequestSpy.mock.calls[0][0].headers).toStrictEqual({
      Authorization: `Bearer ababababab`,
    });
  });

  it('Passthrough OIDC requests must not share cache across users', async () => {
    const URL = `${remoteApiHost}/erfpacht`;

    const auth1 = getAuthProfileAndToken();
    auth1.profile.sid = 'SID-1';
    auth1.token = 'token-user-1';

    const auth2 = getAuthProfileAndToken();
    auth2.profile.sid = 'SID-2';
    auth2.token = 'token-user-2';

    remoteApi
      .get('/erfpacht')
      .matchHeader('authorization', `Bearer ${auth1.token}`)
      .reply(200, { user: 'user-1' });
    remoteApi
      .get('/erfpacht')
      .matchHeader('authorization', `Bearer ${auth2.token}`)
      .reply(200, { user: 'user-2' });

    const requestConfig = {
      url: URL,
      method: 'get',
      passthroughOIDCToken: true,
      enableCache: true,
      headers: {
        'X-HERA-REQUESTORIGIN': 'MijnAmsterdam',
        apiKey: 'enableu-api-key',
      },
    } as const;

    const rs1 = await requestData<{ user: string }>(requestConfig, auth1);
    const rs2 = await requestData<{ user: string }>(requestConfig, auth2);

    expect(rs1.content?.user).toBe('user-1');

    expect(axiosRequestSpy).toHaveBeenCalledTimes(2);
    expect(rs2.content?.user).toBe('user-2');
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
