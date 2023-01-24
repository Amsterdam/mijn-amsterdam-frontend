import MockAdapter from 'axios-mock-adapter';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { ApiUrlEntries, BFF_MS_API_BASE_URL } from '../config';
import { AuthProfileAndToken } from './app';
import {
  axiosRequest,
  cache,
  findApiByRequestUrl,
  requestData,
} from './source-api-request';

describe('requestData.ts', () => {
  const DUMMY_RESPONSE = { foo: 'bar' };
  const DUMMY_RESPONSE_2 = { foo: 'baz' };

  const DUMMY_URL = BFF_MS_API_BASE_URL + '/1';
  const DUMMY_URL_2 = BFF_MS_API_BASE_URL + '/2';

  const SESS_ID_1 = 'x1';
  const SESS_ID_2 = 'y2';

  const AUTH_PROFILE_AND_TOKEN: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private', id: 'bsnxxxx' },
    token: 'xxxxx',
  };

  const CACHE_KEY_1 = `${SESS_ID_1}-get-${DUMMY_URL}-no-params`;
  const CACHE_KEY_2 = `${SESS_ID_2}-get-${DUMMY_URL}-no-params`;

  let axMock: any;
  let axiosRequestSpy: any;

  beforeEach(() => {
    jest.useFakeTimers('modern');
    axMock = new MockAdapter(axiosRequest);
    axMock
      .onGet(DUMMY_URL)
      .replyOnce(200, DUMMY_RESPONSE)
      .onGet(DUMMY_URL)
      .replyOnce(200, DUMMY_RESPONSE_2);

    axMock.onGet(DUMMY_URL_2).networkError();
    axiosRequestSpy = jest.spyOn(axiosRequest, 'request');
  });

  afterEach(() => {
    axMock.restore();
    cache.clear();
    axiosRequestSpy.mockRestore();
  });

  it('A requests succeeds', async () => {
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

  it('Caches the response', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    expect(await cache.get(CACHE_KEY_1).promise).toStrictEqual(rs);

    // Should clear the cache timeout
    jest.runAllTimers();

    expect(cache.get(CACHE_KEY_1)).toBe(null);
  });

  it('Caches the response per session id', async () => {
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

    jest.runAllTimers();

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
    expect(rs).toStrictEqual(apiPostponeResult());
  });

  it('A requests responds with error', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL_2,
      },
      SESS_ID_1,
      AUTH_PROFILE_AND_TOKEN
    );

    const error = new Error('Network Error');

    expect(rs).toStrictEqual(apiErrorResult(error.toString(), null, null));
  });

  test('Find corresponding api', () => {
    const entries: ApiUrlEntries = [
      ['WMO', 'http://get/foo'],
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

    expect(findApiByRequestUrl(entries, 'http://get/foo')).toBe('WMO');
    expect(findApiByRequestUrl(entries, 'http://get/bar')).toBe('BRP');
    expect(findApiByRequestUrl(entries, 'http://get/bar/commercial')).toBe(
      'BRP'
    );
    expect(findApiByRequestUrl(entries, 'http://get/some/thing')).toBe(
      'unknown'
    );
    expect(findApiByRequestUrl(entries, 'http://get')).toBe('unknown');
  });
});
