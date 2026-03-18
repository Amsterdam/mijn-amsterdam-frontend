import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest';

import {
  fetchKrefia,
  fetchKrefiaNotifications,
  fetchAndTransformKrefia,
} from './krefia.ts';
import KrefiaData from '../../../../mocks/fixtures/krefia.json';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';
import { omit } from '../../../universal/helpers/utils.ts';
import { axiosRequest } from '../../helpers/source-api-request.ts';

describe('Kredietbank & FIBU service', () => {
  const KREFIA_DUMMY_RESPONSE = {
    content: {
      deepLinks: [
        {
          link: {
            title: 'Ga naar budgetbeheer',
            to: 'http://host/bbr/2064866/3',
          },
          displayStatus: 'Lopend',
          type: 'budgetbeheer',
        },
        {
          link: {
            title: 'Bekijk uw lening',
            to: 'http://host/pl/2442531/1',
          },
          displayStatus:
            'Kredietsom €1.689,12 met openstaand termijnbedrag €79,66',
          type: 'lening',
        },
        {
          link: {
            title: 'Bekijk uw schuldregeling',
            to: 'http://host/srv/2442531/2',
          },
          displayStatus: 'Afkoopvoorstellen zijn verstuurd',
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

  const authProfileAndToken = getAuthProfileAndToken();

  let axiosRequestSpy: MockInstance;

  beforeAll(() => {
    axiosRequestSpy = vi.spyOn(axiosRequest, 'request');
  });

  afterAll(() => {
    axiosRequestSpy.mockRestore();
  });

  beforeEach(() => {
    axiosRequestSpy.mockClear();
  });

  it('Should respond correctly', async () => {
    remoteApi.get('/krefia/all').times(4).reply(200, KrefiaData);

    const response = await fetchAndTransformKrefia(authProfileAndToken);
    expect(response).toEqual(KREFIA_DUMMY_RESPONSE);

    const responseDerived = await fetchKrefia(authProfileAndToken);

    expect(axiosRequestSpy.mock.calls.length).toEqual(2);

    const contentExpected = {
      content: omit(KREFIA_DUMMY_RESPONSE.content, ['notificationTriggers']),
      status: 'OK',
    };

    expect(responseDerived).toEqual(contentExpected);

    await fetchKrefia(authProfileAndToken);
    expect(axiosRequestSpy.mock.calls.length).toEqual(3);

    const notificationsResponse =
      await fetchKrefiaNotifications(authProfileAndToken);

    expect(notificationsResponse).toEqual({
      content: {
        notifications: [
          {
            id: 'krefia-fibu-notification',
            datePublished: '2021-07-14T12:34:17',
            title: 'Bericht Budgetbeheer (FIBU)',
            themaID: 'KREFIA',
            themaTitle: 'Kredietbank & FIBU',
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
