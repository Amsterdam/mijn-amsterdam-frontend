import {
  authProfileAndToken as authProfileAndToken_,
  remoteApi,
} from '../../../test-utils';
import { ApiErrorResponse } from '../../../universal/helpers/api';
import { fetchSSOParkerenURL } from './parkeren';

const REQUEST_ID = '123';
const STATUS_OK_200 = 200;
const url = 'https://parkeren.nl/sso-login';
const expectedSuccessResponse = { content: url, status: 'OK' };

test('success digid response', async () => {
  const authProfileAndToken = authProfileAndToken_('private');

  remoteApi
    .get('/parkeren/sso/get_authentication_url?service=digid')
    .reply(STATUS_OK_200, {
      url,
    });

  const response = await fetchSSOParkerenURL(REQUEST_ID, authProfileAndToken);
  expect(response).toStrictEqual(expectedSuccessResponse);
});

test('success eherkenning response', async () => {
  let authProfileAndToken = authProfileAndToken_('commercial');

  remoteApi
    .get('/parkeren/sso/get_authentication_url?service=eherkenning')
    .reply(STATUS_OK_200, {
      url,
    });

  const response = await fetchSSOParkerenURL(REQUEST_ID, authProfileAndToken);
  expect(response).toStrictEqual(expectedSuccessResponse);
});

test('returns apiError with unknown profile type', async () => {
  let authProfileAndToken = authProfileAndToken_('private-attributes');
  const response = (await fetchSSOParkerenURL(
    REQUEST_ID,
    authProfileAndToken
  )) as ApiErrorResponse<null>;

  expect(response.code).toBe(400);
  expect(response.content).toBe(null);
  expect(response.status).toBe('ERROR');
});
