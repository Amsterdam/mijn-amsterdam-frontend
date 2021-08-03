import MockAdapter from 'axios-mock-adapter';
import { jsonCopy } from '../../universal/helpers';
import { ApiConfig } from '../config';
import { axiosRequest } from '../helpers';
import financieleHulpData from '../mock-data/json/financiele-hulp.json';
import { fetchFinancieleHulp } from './financiele-hulp';

describe('Toeristische verhuur service', () => {
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

    const response = await fetchFinancieleHulp('x1', { x: 'saml' });

    expect(response.content?.kredietMessages?.length).toBeGreaterThan(0);
    if (!!response.content?.kredietMessages?.length) {
      for (const message of response.content?.kredietMessages) {
        expect(typeof message.datePublished).toBe('string');
        expect(typeof message.url).toBe('string');
      }
    }

    expect(response.content?.fibuMessages?.length).toBeGreaterThan(0);
    if (!!response.content?.fibuMessages?.length) {
      for (const message of response.content?.fibuMessages) {
        expect(typeof message.datePublished).toBe('string');
        expect(typeof message.url).toBe('string');
      }
    }

    expect(response.content?.schuldregelingen?.length).toBeGreaterThan(0);
    if (!!response.content?.schuldregelingen?.length) {
      for (const schuldregeling of response.content?.schuldregelingen) {
        expect(typeof schuldregeling.title).toBe('string');
        expect(typeof schuldregeling.url).toBe('string');
      }
    }

    expect(response.content?.leningen?.length).toBeGreaterThan(0);
    if (!!response.content?.leningen?.length) {
      for (const lening of response.content?.leningen) {
        expect(typeof lening.title).toBe('string');
        expect(typeof lening.url).toBe('string');
      }
    }

    expect(response.content?.budgetbeheer?.length).toBeGreaterThan(0);
    if (!!response.content?.budgetbeheer?.length) {
      for (const budgetbeheer of response.content?.budgetbeheer) {
        expect(typeof budgetbeheer.title).toBe('string');
        expect(typeof budgetbeheer.url).toBe('string');
      }
    }
  });
});
