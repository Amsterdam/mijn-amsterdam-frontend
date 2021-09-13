import MockAdapter from 'axios-mock-adapter';
import { fetchFinancieleHulpGenerated } from '.';

import { jsonCopy, omit } from '../../universal/helpers';
import { ApiConfig } from '../config';
import { axiosRequest } from '../helpers';
import financieleHulpData from '../mock-data/json/financiele-hulp.json';
import { fetchFinancieleHulp, fetchSource } from './financiele-hulp';

describe('Financiële hulp service', () => {
  const FINANCIELE_HULP_DUMMY_RESPONSE = jsonCopy(financieleHulpData);

  const DUMMY_URL_FINANCIELE_HULP = '/financiele-hulp';

  ApiConfig.FINANCIELE_HULP.url = DUMMY_URL_FINANCIELE_HULP;

  let axMock: any;
  let axiosRequestSpy: any;

  beforeEach(() => {
    axMock = new MockAdapter(axiosRequest);
    axMock
      .onGet(DUMMY_URL_FINANCIELE_HULP)
      .reply(200, FINANCIELE_HULP_DUMMY_RESPONSE);

    axiosRequestSpy = jest.spyOn(axiosRequest, 'request');
  });

  afterEach(() => {
    axMock.restore();
    axiosRequestSpy.mockRestore();
  });

  it('Should respond correctly', async () => {
    const response = await fetchSource('x1', { x: 'saml' });
    expect(response).toEqual(FINANCIELE_HULP_DUMMY_RESPONSE);

    const responseDerived = await fetchFinancieleHulp('x1', { x: 'saml' });
    expect(axiosRequestSpy.mock.calls.length).toEqual(1); // Use cached version

    const contentExpected = {
      content: omit(FINANCIELE_HULP_DUMMY_RESPONSE.content, [
        'notificationTriggers',
      ]),
      status: 'OK',
    };

    expect(responseDerived).toEqual(contentExpected);

    await fetchFinancieleHulp('x2', { x: 'saml' });
    expect(axiosRequestSpy.mock.calls.length).toEqual(2);

    const generatedResponse = await fetchFinancieleHulpGenerated('x1', {
      x: 'saml',
    });

    expect(generatedResponse).toEqual({
      content: {
        notifications: [
          {
            id: 'financiele-hulp-fibu-notification',
            datePublished: '2021-08-24',
            title: 'Bericht FiBu',
            chapter: 'FINANCIELE_HULP',
            description: 'Er staan ongelezen berichten voor u klaar van FiBu',
            link: { to: 'https://linktofibu/123', title: 'Bekijk uw bericht' },
          },
          {
            id: 'financiele-hulp-krediet-notification',
            datePublished: '2021-08-24',
            title: 'Bericht Kredietbank',
            chapter: 'FINANCIELE_HULP',
            description:
              'Er staan ongelezen berichten voor u klaar van de kredietbank',
            link: { to: 'https://linktofibu/123', title: 'Bekijk uw bericht' },
          },
        ],
      },
      status: 'OK',
    });
  });
});
