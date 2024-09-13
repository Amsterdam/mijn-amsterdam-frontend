import { getAuthProfileAndToken, remoteApi } from '../../../test-utils';
import { getFromEnv } from '../../helpers/env';
import { fetchSSOParkerenURL } from './parkeren';

const REQUEST_ID = '123';
const STATUS_OK_200 = 200;
const SUCCESS_URL = 'https://parkeren.nl/sso-login';
const FALLBACK_URL = getFromEnv('BFF_PARKEREN_EXTERNAL_FALLBACK_URL');

beforeEach(() => {
  vi.clearAllMocks();
});

test('Calls with digid', async () => {
  const authProfileAndToken = getAuthProfileAndToken('private');

  remoteApi
    .get('/parkeren/sso/get_authentication_url?service=digid')
    .reply(STATUS_OK_200, {
      url: SUCCESS_URL,
    });

  const response = await fetchSSOParkerenURL(REQUEST_ID, authProfileAndToken);

  expect(response).toStrictEqual({
    content: {
      isKnown: true,
      url: SUCCESS_URL,
    },
    status: 'OK',
  });
});

test('Calls with eherkenning', async () => {
  let authProfileAndToken = getAuthProfileAndToken('commercial');

  remoteApi
    .get('/parkeren/sso/get_authentication_url?service=eherkenning')
    .reply(STATUS_OK_200, {
      url: SUCCESS_URL,
    });

  const response = await fetchSSOParkerenURL(REQUEST_ID, authProfileAndToken);

  expect(response).toStrictEqual({
    content: {
      isKnown: true,
      url: SUCCESS_URL,
    },
    status: 'OK',
  });
});

describe('Fallback url given', async () => {
  const ERROR_TRANSFORMED_RESPONSE = {
    content: {
      isKnown: true,
      url: FALLBACK_URL,
    },
    status: 'OK',
  };

  test('When URL is null', async () => {
    let authProfileAndToken = getAuthProfileAndToken('private');

    remoteApi
      .get('/parkeren/sso/get_authentication_url?service=digid')
      .reply(STATUS_OK_200, {
        url: null,
      });

    const response = await fetchSSOParkerenURL(REQUEST_ID, authProfileAndToken);

    expect(response).toStrictEqual(ERROR_TRANSFORMED_RESPONSE);
  });

  test('When no url in response', async () => {
    let authProfileAndToken = getAuthProfileAndToken('private');

    remoteApi
      .get('/parkeren/sso/get_authentication_url?service=digid')
      .reply(200, { url: undefined });

    const response = await fetchSSOParkerenURL(REQUEST_ID, authProfileAndToken);

    expect(response).toStrictEqual(ERROR_TRANSFORMED_RESPONSE);
  });

  test('When status errors', async () => {
    let authProfileAndToken = getAuthProfileAndToken('private');

    remoteApi
      .get('/parkeren/sso/get_authentication_url?service=digid')
      .reply(404);

    const response = await fetchSSOParkerenURL(REQUEST_ID, authProfileAndToken);

    expect(response).toStrictEqual(ERROR_TRANSFORMED_RESPONSE);
  });
});
