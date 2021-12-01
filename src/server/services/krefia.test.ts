import MockAdapter from 'axios-mock-adapter';
import { fetchKrefiaGenerated } from '.';

import { jsonCopy, omit } from '../../universal/helpers';
import { ApiConfig } from '../config';
import { axiosRequest } from '../helpers';
import KrefiaData from '../mock-data/json/krefia.json';
import { fetchKrefia, fetchSource } from './krefia';

describe('Kredietbank & FIBU service', () => {
  const KREFIA_DUMMY_RESPONSE = jsonCopy(KrefiaData);

  const DUMMY_URL_KREFIA = '/krefia';

  ApiConfig.KREFIA.url = DUMMY_URL_KREFIA;

  let axMock: any;
  let axiosRequestSpy: any;

  beforeEach(() => {
    axMock = new MockAdapter(axiosRequest);
    axMock.onGet(DUMMY_URL_KREFIA).reply(200, KREFIA_DUMMY_RESPONSE);

    axiosRequestSpy = jest.spyOn(axiosRequest, 'request');
  });

  afterEach(() => {
    axMock.restore();
    axiosRequestSpy.mockRestore();
  });

  it('Should respond correctly', async () => {
    const response = await fetchSource('x1', { x: 'saml' });
    expect(response).toEqual(KREFIA_DUMMY_RESPONSE);

    const responseDerived = await fetchKrefia('x1', { x: 'saml' });
    expect(axiosRequestSpy.mock.calls.length).toEqual(1); // Use cached version

    const contentExpected = {
      content: omit(KREFIA_DUMMY_RESPONSE.content, ['notificationTriggers']),
      status: 'OK',
    };

    expect(responseDerived).toEqual(contentExpected);

    await fetchKrefia('x2', { x: 'saml' });
    expect(axiosRequestSpy.mock.calls.length).toEqual(2);

    const generatedResponse = await fetchKrefiaGenerated('x1', {
      x: 'saml',
    });

    expect(generatedResponse).toEqual({
      content: {
        notifications: [
          {
            id: 'krefia-fibu-notification',
            datePublished: '2021-07-14T12:34:17',
            title: 'Bericht FiBu',
            chapter: 'KREFIA',
            description: 'Er staan ongelezen berichten voor u klaar van FiBu',
            link: {
              to: 'http://host/berichten/fibu',
              title: 'Bekijk uw bericht',
            },
          },
        ],
      },
      status: 'OK',
    });
  });
});
