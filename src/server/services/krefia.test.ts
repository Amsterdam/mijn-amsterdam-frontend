import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { fetchKrefia, fetchKrefiaNotifications, fetchSource } from './krefia';
import KrefiaData from '../../../mocks/fixtures/krefia.json';
import { remoteApi } from '../../testing/utils';
import { jsonCopy, omit } from '../../universal/helpers/utils';
import { AuthProfileAndToken } from '../auth/auth-types';
import { axiosRequest } from '../helpers/source-api-request';

describe('Kredietbank & FIBU service', () => {
  const KREFIA_DUMMY_RESPONSE = jsonCopy(KrefiaData);
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private', sid: '', id: '' },
    token: 'xxxxxx',
  };

  let axiosRequestSpy: any;

  beforeAll(() => {
    axiosRequestSpy = vi.spyOn(axiosRequest, 'request');
  });

  afterAll(() => {
    axiosRequestSpy.mockRestore();
  });

  it('Should respond correctly', async () => {
    remoteApi.get('/krefia/all').reply(200, KREFIA_DUMMY_RESPONSE);

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
            thema: 'KREFIA',
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
