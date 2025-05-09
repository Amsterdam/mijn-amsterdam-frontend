import MockDate from 'mockdate';
import { Mock, vi } from 'vitest';

import { fetchToeristischeVerhuur } from './toeristische-verhuur';
import { fetchToeristischeVerhuurNotifications } from './toeristische-verhuur-notifications';
import { themaId } from '../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config';
import { getAuthProfileAndToken } from '../../../testing/utils';
import { MONTHS_TO_KEEP_NOTIFICATIONS } from '../../../universal/config/app';
import { apiSuccessResult } from '../../../universal/helpers/api';

vi.mock('./toeristische-verhuur');

describe('fetchToeristischeVerhuurNotifications', () => {
  const mockAuthProfileAndToken = getAuthProfileAndToken();

  beforeAll(() => {
    MockDate.set('2025-03-01');
  });

  afterAll(() => {
    MockDate.reset();
  });

  it('should return (default) notifications for toeristische verhuur', async () => {
    (fetchToeristischeVerhuur as unknown as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        vakantieverhuurVergunningen: [
          {
            id: '1',
            title: 'Vakantie',
            identifier: '12345',
            decision: 'Verleend',
            dateEnd: '2025-12-31',
            dateRequest: '2025-01-01',
            processed: false,
            steps: [],
          },
        ],
        bbVergunningen: [
          {
            id: '2',
            title: 'Bed & breakfast',
            identifier: '67890',
            decision: 'Verleend',
            dateEnd: '2025-12-31',
            dateRequest: '2025-01-01',
            processed: false,
            steps: [],
          },
        ],
        lvvRegistraties: [
          {
            registrationNumber: 'REG123',
            agreementDate: '2025-01-01',
          },
        ],
      })
    );

    const result = await fetchToeristischeVerhuurNotifications(
      mockAuthProfileAndToken
    );

    expect(result.content.notifications).toHaveLength(3);
    expect(result.content.notifications).toStrictEqual([
      {
        datePublished: '2025-01-01',
        description:
          'Wij hebben uw aanvraag voor een vakantie met gemeentelijk zaaknummer 12345 in behandeling.',
        id: 'vergunning-1-notification',
        link: {
          title: 'Bekijk uw aanvraag',
          to: '/toeristische-verhuur',
        },
        themaID: themaId,
        themaTitle: 'Toeristische verhuur',
        title: 'Aanvraag vakantie in behandeling',
      },
      {
        datePublished: '2025-01-01',
        description:
          'Wij hebben uw aanvraag voor een bed & breakfast met gemeentelijk zaaknummer 67890 in behandeling.',
        id: 'vergunning-2-notification',
        link: {
          title: 'Bekijk uw aanvraag',
          to: '/toeristische-verhuur',
        },
        themaID: themaId,
        themaTitle: 'Toeristische verhuur',
        title: 'Aanvraag bed & breakfast in behandeling',
      },
      {
        datePublished: '2025-01-01',
        description:
          'Uw landelijke registratienummer voor toeristische verhuur is toegekend. Uw registratienummer is REG123.',
        id: 'toeristiche-verhuur-registratie-REG123-notification',
        link: {
          title: 'Bekijk uw overzicht toeristische verhuur',
          to: '/toeristische-verhuur',
        },
        themaID: themaId,
        themaTitle: 'Toeristische verhuur',
        title: 'Aanvraag landelijk registratienummer toeristische verhuur',
      },
    ]);
  });

  it('should not return expired notifications', async () => {
    (fetchToeristischeVerhuur as unknown as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        vakantieverhuurVergunningen: [
          {
            id: '1',
            title: 'Vakantie',
            identifier: '12345',
            decision: 'Verleend',
            dateEnd: '2024-12-31',
            processed: true,
            steps: [],
          },
        ],
        bbVergunningen: [
          {
            id: '2',
            title: 'Bed & breakfast',
            identifier: '67890',
            decision: 'Verleend',
            dateEnd: '2024-12-31',
            processed: true,
            steps: [],
          },
        ],
        lvvRegistraties: [
          {
            registrationNumber: 'REG123',
            agreementDate: '2024-01-01',
          },
        ],
      })
    );

    const result = await fetchToeristischeVerhuurNotifications(
      mockAuthProfileAndToken
    );

    expect(result.content.notifications).toHaveLength(0);
  });

  it(`should only return Afgehandelde notifications less than ${MONTHS_TO_KEEP_NOTIFICATIONS} month old`, async () => {
    (fetchToeristischeVerhuur as unknown as Mock).mockResolvedValueOnce(
      apiSuccessResult({
        vakantieverhuurVergunningen: [
          {
            id: '1',
            title: 'Vakantie',
            identifier: '12345',
            decision: 'Verleend',
            dateDecision: '2025-02-10',
            processed: true,
            steps: [],
          },
          {
            id: '1b',
            title: 'Vakantie',
            identifier: '12345',
            decision: 'Verleend',
            dateDecision: '2024-11-30', // More than 3 months old
            processed: true,
            steps: [],
          },
        ],
        bbVergunningen: [
          {
            id: '2',
            title: 'Bed & breakfast',
            identifier: '67890',
            decision: 'Verleend',
            dateDecision: '2025-02-10',
            processed: true,
            steps: [],
          },
          {
            id: '2b',
            title: 'Bed & breakfast',
            identifier: '67890',
            decision: 'Verleend',
            dateDecision: '2024-11-30', // More than 3 months old
            processed: true,
            steps: [],
          },
        ],
        lvvRegistraties: [
          {
            registrationNumber: 'REG123',
            agreementDate: '2025-02-10',
          },
          {
            registrationNumber: 'REG123b',
            agreementDate: '2024-11-30', // More than 3 months old
          },
        ],
      })
    );

    const result = await fetchToeristischeVerhuurNotifications(
      mockAuthProfileAndToken
    );

    expect(result.content.notifications).toHaveLength(3);
    expect(result.content.notifications.map((n) => n.id)).toStrictEqual([
      // NOTE: These are the transformed notification ID's related to the mocked response from fetchToeristischeVerhuur.
      // The ID's are generated in the createToeristischeVerhuurNotification and createRegistratieNotification functions.
      'vergunning-1-notification',
      'vergunning-2-notification',
      'toeristiche-verhuur-registratie-REG123-notification',
    ]);
  });
});
