import {
  authProfileAndToken as authProfileAndToken_,
  remoteApi,
} from '../../../test-utils';
import { ApiErrorResponse } from '../../../universal/helpers/api';
import { fetchSSOParkerenURL } from './parkeren';

const requestData = vi.hoisted(() => {
  return vi.fn();
});

vi.mock('../../helpers/source-api-request.ts', async () => {
  const module: object = await vi.importActual(
    '../../helpers/source-api-request.ts'
  );
  return {
    ...module,
    requestData,
  };
});

const REQUEST_ID = '123';
const STATUS_OK_200 = 200;
const url = 'https://parkeren.nl/sso-login';

beforeEach(() => {
  vi.clearAllMocks();
});

test('Calls with digid', async () => {
  const authProfileAndToken = authProfileAndToken_('private');

  remoteApi
    .get('/parkeren/sso/get_authentication_url?service=digid')
    .reply(STATUS_OK_200, {
      url,
    });

  await fetchSSOParkerenURL(REQUEST_ID, authProfileAndToken);

  const requestConfigURL = requestData.mock.calls[0][0].url;

  expect(requestConfigURL).toBe(
    'http://remote-api-host/parkeren/sso/get_authentication_url?service=digid'
  );
});

test('Calls with eherkenning', async () => {
  let authProfileAndToken = authProfileAndToken_('commercial');

  remoteApi
    .get('/parkeren/sso/get_authentication_url?service=eherkenning')
    .reply(STATUS_OK_200, {
      url,
    });

  await fetchSSOParkerenURL(REQUEST_ID, authProfileAndToken);

  const requestConfigURL = requestData.mock.calls[0][0].url;

  expect(requestConfigURL).toBe(
    'http://remote-api-host/parkeren/sso/get_authentication_url?service=eherkenning'
  );
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

test('requestData is called for correct errorhandling etc...', async () => {
  let authProfileAndToken = authProfileAndToken_('private');

  (await fetchSSOParkerenURL(
    REQUEST_ID,
    authProfileAndToken
  )) as ApiErrorResponse<null>;

  expect(requestData).toHaveBeenCalled();
});
