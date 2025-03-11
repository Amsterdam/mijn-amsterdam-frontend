import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { fetchKrefia, fetchKrefiaNotifications, fetchSource } from './krefia';
import KrefiaData from '../../../mocks/fixtures/krefia.json';
import { remoteApi } from '../../testing/utils';
import { omit } from '../../universal/helpers/utils';
import { AuthProfileAndToken } from '../auth/auth-types';
import { axiosRequest } from '../helpers/source-api-request';

describe('Kredietbank & FIBU service', () => {
  const KREFIA_DUMMY_RESPONSE = {
    content: {
      deepLinks: [
        {
          link: {
            title: 'Ga naar budgetbeheer',
            to: 'http://host/bbr/2064866/3',
          },
          status: 'Lopend',
          type: 'budgetbeheer',
        },
        {
          link: {
            title: 'Bekijk uw lening',
            to: 'http://host/pl/2442531/1',
          },
          status: 'Kredietsom €1.689,12 met openstaand termijnbedrag €79,66',
          type: 'lening',
        },
        {
          link: {
            title: 'Bekijk uw schuldregeling',
            to: 'http://host/srv/2442531/2',
          },
          status: 'Afkoopvoorstellen zijn verstuurd',
          type: 'schuldhulp',
        },
      ],
      notificationTriggers: {
        fibu: {
          datePublished: '2021-07-14T12:34:17',
          url: 'http://host/berichten/fibu',
        },
        krediet: null,
      },
    },
    status: 'OK',
  };

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
    remoteApi.get('/krefia/all').reply(200, KrefiaData);

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
