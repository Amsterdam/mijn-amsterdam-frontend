import MockAdapter from 'axios-mock-adapter';
import { fetchKrefiaNotifications } from '.';

import { jsonCopy, omit } from '../../universal/helpers';
import { ApiConfig } from '../config';
import { axiosRequest } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';
import KrefiaData from '../mock-data/json/krefia.json';
import { fetchKrefia, fetchSource } from './krefia';

describe('Kredietbank & FIBU service', () => {
  const KREFIA_DUMMY_RESPONSE = jsonCopy(KrefiaData);
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private' },
    token: 'xxxxxx',
  };

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
    const response = await fetchSource('x1', authProfileAndToken);
    expect(response).toEqual(KREFIA_DUMMY_RESPONSE);

    const responseDerived = await fetchKrefia('x1', authProfileAndToken);
    expect(axiosRequestSpy.mock.calls.length).toEqual(1); // Use cached version

    const contentExpected = {
      content: omit(KREFIA_DUMMY_RESPONSE.content, ['notificationTriggers']),
      status: 'OK',
    };

    expect(responseDerived).toEqual(contentExpected);

    await fetchKrefia('x2', authProfileAndToken);
    expect(axiosRequestSpy.mock.calls.length).toEqual(2);

    const notificationsResponse = await fetchKrefiaNotifications(
      'x1',
      authProfileAndToken
    );

    expect(notificationsResponse).toEqual({
      content: {
        notifications: [
          {
            id: 'krefia-fibu-notification',
            datePublished: '2021-07-14T12:34:17',
            title: 'Bericht Budgetbeheer (FIBU)',
            chapter: 'KREFIA',
            description:
              'Er staan ongelezen berichten voor u klaar van Budgetbeheer (FIBU)',
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
