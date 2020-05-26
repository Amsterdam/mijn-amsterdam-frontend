import { requestData, axiosRequest, cache } from './request';
import MockAdapter from 'axios-mock-adapter';
import { AxiosError } from 'axios';
import {
  apiSuccesResult,
  apiPostponeResult,
  apiErrorResult,
} from '../../universal/helpers/api';

describe('requestData.ts', () => {
  const DUMMY_RESPONSE = { foo: 'bar' };
  const DUMMY_RESPONSE_2 = { foo: 'baz' };

  const DUMMY_URL = 'https://url';
  const DUMMY_URL_2 = 'https://url/error';

  const SESS_ID_1 = 'x1';
  const SESS_ID_2 = 'y2';

  const SAML_TOKEN = 'xxx1010101xxxx';

  const CACHE_KEY_1 = `${SESS_ID_1}-get-${DUMMY_URL}-no-params`;
  const CACHE_KEY_2 = `${SESS_ID_2}-get-${DUMMY_URL}-no-params`;

  let axMock: any;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    axMock.restore();
    cache.clear();
  });

  beforeEach(() => {
    axMock = new MockAdapter(axiosRequest);
    axMock
      .onGet(DUMMY_URL)
      .replyOnce(200, DUMMY_RESPONSE)
      .onGet(DUMMY_URL)
      .replyOnce(200, DUMMY_RESPONSE_2);

    axMock.onGet(DUMMY_URL_2).networkError();
  });

  it('A requests succeeds', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SAML_TOKEN,
      SESS_ID_1
    );

    expect(rs).toStrictEqual(apiSuccesResult(DUMMY_RESPONSE));
  });

  it('Caches the response', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL,
      },
      SAML_TOKEN,
      SESS_ID_1
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
      SAML_TOKEN,
      SESS_ID_1
    );

    const rs2 = await requestData(
      {
        url: DUMMY_URL,
      },
      SAML_TOKEN,
      SESS_ID_2
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
      },
      SAML_TOKEN,
      SESS_ID_1,
      true
    );

    expect(rs).toStrictEqual(apiPostponeResult());
  });

  it('A requests responds with error', async () => {
    const rs = await requestData(
      {
        url: DUMMY_URL_2,
      },
      SAML_TOKEN,
      SESS_ID_1
    );

    expect(rs).toStrictEqual(
      apiErrorResult(new Error('Network Error') as AxiosError, null)
    );
  });
});
