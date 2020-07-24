import MockAdapter from 'axios-mock-adapter';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccesResult,
} from '../../universal/helpers/api';
import { BFF_MS_API_BASE_URL, TMA_SAML_HEADER } from '../config';
import { axiosRequest, cache, requestData } from './source-api-request';

describe('requestData.ts', () => {
  const DUMMY_RESPONSE = { foo: 'bar' };
  const DUMMY_RESPONSE_2 = { foo: 'baz' };

  const DUMMY_URL = BFF_MS_API_BASE_URL + '/1';
  const DUMMY_URL_2 = BFF_MS_API_BASE_URL + '/2';

  const SESS_ID_1 = 'x1';
  const SESS_ID_2 = 'y2';

  const SAML_TOKEN = 'xxx1010101xxxx';
  const HEADERS = { [TMA_SAML_HEADER]: SAML_TOKEN };

  const CACHE_KEY_1 = `${SESS_ID_1}-get-${DUMMY_URL}-no-params`;
  const CACHE_KEY_2 = `${SESS_ID_2}-get-${DUMMY_URL}-no-params`;

  let axMock: any;
  let axiosRequestSpy: any;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
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
      HEADERS
    );

    expect(rs).toStrictEqual(apiSuccesResult(DUMMY_RESPONSE));
  });

  it('Should make request with passthrough headers', async () => {
    await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      HEADERS
    );

    expect(axiosRequestSpy).toHaveBeenCalledTimes(1);
    expect(axiosRequestSpy.mock.calls[0][0].headers).toEqual(HEADERS);
  });

  it('Caches the response', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      HEADERS
    );

    expect(await cache.get(CACHE_KEY_1).promise).toStrictEqual(rs);

    jest.runAllTimers();

    expect(cache.get(CACHE_KEY_1)).toBe(null);
  });

  it('Caches the response per session id', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_1,
      HEADERS
    );

    const rs2 = await requestData(
      {
        url: DUMMY_URL,
      },
      SESS_ID_2,
      HEADERS
    );

    expect(await cache.get(CACHE_KEY_1).promise).toStrictEqual(
      apiSuccesResult(DUMMY_RESPONSE)
    );
    expect(await cache.get(CACHE_KEY_1).promise).toStrictEqual(rs);
    expect(await cache.get(CACHE_KEY_2).promise).toStrictEqual(
      apiSuccesResult(DUMMY_RESPONSE_2)
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
      HEADERS
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
      HEADERS
    );

    const error = new Error('Network Error');

    expect(rs).toStrictEqual(apiErrorResult(error.toString(), null, null));
  });
});
