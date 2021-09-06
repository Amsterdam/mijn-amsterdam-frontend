import MockAdapter from 'axios-mock-adapter';

import { jsonCopy } from '../../universal/helpers';
import { ApiConfig } from '../config';
import { axiosRequest } from '../helpers';
import financieleHulpData from '../mock-data/json/financiele-hulp.json';
import { fetchFinancieleHulp, fetchSource } from './financiele-hulp';

describe('Financiële hulp service', () => {
  const axMock = new MockAdapter(axiosRequest);
  const FINANCIELE_HULP_DUMMY_RESPONSE = jsonCopy(financieleHulpData);

  const API_URL = ApiConfig.FINANCIELE_HULP.url;

  const DUMMY_URL_FINANCIELE_HULP = '/financiele-hulp';
  const DUMMY_URL_NULL_CONTENT = '/null-content';
  const DUMMY_URL_ERROR = '/error-response';

  jest.useFakeTimers('modern').setSystemTime(new Date('2021-07-07').getTime());

  afterAll(() => {
    axMock.restore();
    ApiConfig.FINANCIELE_HULP.url = API_URL;
  });

  afterEach(() => {
    ApiConfig.FINANCIELE_HULP.url = DUMMY_URL_FINANCIELE_HULP;
  });

  axMock
    .onGet(DUMMY_URL_FINANCIELE_HULP)
    .reply(200, FINANCIELE_HULP_DUMMY_RESPONSE);

  axMock.onGet(DUMMY_URL_NULL_CONTENT).reply(200, null);
  axMock.onGet(DUMMY_URL_ERROR).reply(500, { message: 'fat chance!' });

  it('Should respond with data', async () => {
    ApiConfig.FINANCIELE_HULP.url = DUMMY_URL_FINANCIELE_HULP;

    const response = await fetchSource('x1', { x: 'saml' });
    const kredietMessage = response.content?.notificationTriggers?.krediet;
    if (!!kredietMessage) {
      expect(typeof kredietMessage.datePublished).toBe('string');
      expect(typeof kredietMessage.url).toBe('string');
    }
    const fibuMessage = response.content?.notificationTriggers?.fibu;
    if (!!fibuMessage) {
      expect(typeof fibuMessage.datePublished).toBe('string');
      expect(typeof fibuMessage.url).toBe('string');
    }

    const schuldhulp = response.content?.deepLinks?.schuldhulp;
    if (!!schuldhulp) {
      expect(typeof schuldhulp.title).toBe('string');
      expect(typeof schuldhulp.url).toBe('string');
    }

    const lening = response.content?.deepLinks?.lening;
    if (!!lening) {
      expect(typeof lening.title).toBe('string');
      expect(typeof lening.url).toBe('string');
    }

    const budgetbeheer = response.content?.deepLinks?.budgetbeheer;
    if (!!budgetbeheer) {
      expect(typeof budgetbeheer.title).toBe('string');
      expect(typeof budgetbeheer.url).toBe('string');
    }
  });
});
