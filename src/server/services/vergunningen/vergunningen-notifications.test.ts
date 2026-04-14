import MockDate from 'mockdate';
import type { Mock } from 'vitest';
import { describe, it, expect, vi } from 'vitest';

import {
  caseTypeVergunningen,
  type DecosZaakFrontend,
} from './config-and-types.ts';
import {
  createNotificationDefault,
  getVergunningNotifications,
  fetchVergunningenNotifications,
} from './vergunningen-notifications.ts';
import { fetchVergunningen } from './vergunningen.ts';
import { themaConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config.ts';
import { getAuthProfileAndToken } from '../../../testing/utils.ts';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api.ts';

vi.mock('./vergunningen', () => ({
  fetchVergunningen: vi.fn(),
}));

describe('vergunningen-notifications', () => {
  describe('createVergunningNotification', () => {
    beforeAll(() => {
      MockDate.set('2023-01-10');
    });

    afterAll(() => {
      MockDate.reset();
    });

    it('should create a notification with valid labels', () => {
      const vergunning = {
        id: '1',
        caseType: 'TestCase',
        identifier: 'Z/123/456',
        title: 'Test case',
        link: { to: '/test', title: 'Test' },
        steps: [
          { status: 'Ontvangen', datePublished: '2023-01-10', isActive: true },
        ],
      } as unknown as DecosZaakFrontend;

      const notification = createNotificationDefault(vergunning, {
        themaID: themaConfig.id,
        themaTitle: themaConfig.title,
      });
      expect(notification).toHaveProperty(
        'title',
        'Aanvraag Test case ontvangen'
      );
      expect(notification).toHaveProperty(
        'description',
        'Wij hebben uw aanvraag Test case met zaaknummer Z/123/456 ontvangen.'
      );
      expect(notification).toHaveProperty('datePublished', '2023-01-10');
      expect(notification).toHaveProperty('link', {
        to: '/test',
        title: 'Bekijk details',
      });
    });

    it('should return null if no notification labels', () => {
      const vergunning = {
        id: '1',
        caseType: 'TestCase',
        link: { to: '/test', title: 'Test' },
        steps: [],
      } as unknown as DecosZaakFrontend;

      const notification = createNotificationDefault(vergunning, {
        themaID: themaConfig.id,
        themaTitle: themaConfig.title,
      });
      expect(notification).toBeNull();
    });

    describe('expiry notifications', () => {
      const vergunning = {
        id: '1',
        caseType: caseTypeVergunningen.RVVSloterweg,
        identifier: 'Z/123/456',
        title: 'Test case',
        link: { to: '/test', title: 'Test' },
        dateStart: '2022-12-10',
        dateEnd: '2023-01-15',
        isExpired: false,
        steps: [
          {
            status: 'Ontvangen',
            datePublished: '2022-11-10',
            isActive: false,
          },
          {
            status: 'In behandeling',
            datePublished: '2022-11-10',
            isActive: false,
          },
          {
            status: 'Afgehandeld',
            datePublished: '2022-11-17',
            isActive: true,
          },
        ],
      } as unknown as DecosZaakFrontend;

      it('should create a expiry notification with "vraag zonodig een nieuwe aan" link if end date is near', () => {
        const notification = createNotificationDefault(vergunning, {
          themaID: themaConfig.id,
          themaTitle: themaConfig.title,
        });
        expect(notification).toHaveProperty('title', 'Uw Test case loopt af');
        expect(notification).toHaveProperty(
          'description',
          'Uw vergunning Test case met zaaknummer Z/123/456 loopt binnenkort af, <a href="https://www.amsterdam.nl/vergunningen-ontheffingen/verlengen-ontheffing-sloterweg-laan/" rel="noopener noreferrer">vraag zonodig een nieuwe aan</a>.'
        );
        expect(notification).toHaveProperty(
          'datePublished',
          '2023-01-08T00:00:00.000Z'
        );
        expect(notification).toHaveProperty('link', {
          to: '/test',
          title: 'Bekijk details',
        });
      });

      it('should create a expiry notification without "vraag zonodig een nieuwe aan" link if end date is near', () => {
        const notification = createNotificationDefault(
          { ...vergunning, caseType: 'BlaBla' },
          {
            themaID: themaConfig.id,
            themaTitle: themaConfig.title,
          }
        );
        expect(notification).toHaveProperty(
          'description',
          'Uw vergunning Test case met zaaknummer Z/123/456 loopt binnenkort af, vraag zonodig een nieuwe aan.'
        );
      });
    });
  });

  describe('getVergunningNotifications', () => {
    beforeAll(() => {
      MockDate.set('2025-01-10');
    });

    afterAll(() => {
      MockDate.reset();
    });

    it('should return notifications for valid vergunningen and transformers', () => {
      const vergunningen = [
        {
          id: '1',
          title: 'Test case',
          identifier: 'Z/123/456',
          steps: [
            {
              status: 'Ontvangen',
              datePublished: '2025-01-05',
              isActive: true,
            },
          ],
          link: { to: '/test', title: 'Test' },
        },
        {
          id: '2',
          title: 'Test case',
          identifier: 'Z/888/999',
          steps: [
            {
              status: 'In behandeling',
              datePublished: '2025-01-07',
              isActive: true,
            },
          ],
          link: { to: '/test', title: 'Test' },
        },
        {
          id: '3',
          title: 'Test case',
          identifier: 'Z/999/000',
          steps: [
            {
              status: 'Afgehandeld',
              datePublished: '2025-01-08',
              isActive: true,
            },
          ],
          link: { to: '/test', title: 'Test' },
        },
        {
          id: '4',
          title: 'Test case',
          identifier: 'Z/111222/000',
          steps: [
            {
              status: 'Afgehandeld',
              datePublished: '2025-01-08',
              isActive: false,
            },
            {
              status: 'Verlopen',
              datePublished: '2025-01-09',
              isActive: true,
            },
          ],
          link: { to: '/test', title: 'Test' },
        },
        {
          id: '5',
          title: 'Test case',
          identifier: 'Z/111222/000',
          steps: [
            {
              status: 'Afgehandeld',
              datePublished: '2025-01-08',
              isActive: false,
            },
            {
              status: 'Ingetrokken',
              datePublished: '',
              isActive: true,
            },
          ],
          link: { to: '/test', title: 'Test' },
        },
      ] as unknown as DecosZaakFrontend[];

      const notifications = getVergunningNotifications(
        vergunningen,
        themaConfig.id,
        themaConfig.title
      );
      expect(notifications).toStrictEqual([
        {
          datePublished: '2025-01-05',
          description:
            'Wij hebben uw aanvraag Test case met zaaknummer Z/123/456 ontvangen.',
          id: 'vergunning-1-notification',
          link: {
            title: 'Bekijk details',
            to: '/test',
          },
          themaID: 'VERGUNNINGEN',
          themaTitle: 'Vergunningen en ontheffingen',
          title: 'Aanvraag Test case ontvangen',
        },
        {
          datePublished: '2025-01-07',
          description:
            'Wij hebben uw aanvraag Test case met zaaknummer Z/888/999 in behandeling genomen.',
          id: 'vergunning-2-notification',
          link: {
            title: 'Bekijk details',
            to: '/test',
          },
          themaID: 'VERGUNNINGEN',
          themaTitle: 'Vergunningen en ontheffingen',
          title: 'Aanvraag Test case in behandeling',
        },
        {
          datePublished: '2025-01-08',
          description:
            'Wij hebben uw aanvraag Test case met zaaknummer Z/999/000 afgehandeld.',
          id: 'vergunning-3-notification',
          link: {
            title: 'Bekijk details',
            to: '/test',
          },
          themaID: 'VERGUNNINGEN',
          themaTitle: 'Vergunningen en ontheffingen',
          title: 'Aanvraag Test case afgehandeld',
        },
        {
          datePublished: '2025-01-09',
          description:
            'Uw vergunning Test case met zaaknummer Z/111222/000 is verlopen.',
          id: 'vergunning-4-notification',
          link: {
            title: 'Bekijk details',
            to: '/test',
          },
          themaID: 'VERGUNNINGEN',
          themaTitle: 'Vergunningen en ontheffingen',
          title: 'Test case verlopen',
        },
        {
          datePublished: '2025-01-08',
          description:
            'Wij hebben uw aanvraag Test case met zaaknummer Z/111222/000 afgehandeld.',
          id: 'vergunning-5-notification',
          link: {
            title: 'Bekijk details',
            to: '/test',
          },
          themaID: 'VERGUNNINGEN',
          themaTitle: 'Vergunningen en ontheffingen',
          title: 'Aanvraag Test case afgehandeld',
        },
      ]);
    });

    it('should return empty array if no matching transformers', () => {
      const vergunningen = [
        {
          steps: [],
        },
      ] as unknown as DecosZaakFrontend[];

      const notifications = getVergunningNotifications(
        vergunningen,
        themaConfig.id,
        themaConfig.title
      );
      expect(notifications).toHaveLength(0);
    });
  });

  describe('fetchVergunningenNotifications', () => {
    const authProfileAndToken = getAuthProfileAndToken();

    it('should return notifications if fetchVergunningen is successful', async () => {
      const vergunningen = [
        {
          id: '1',
          caseType: 'VOB',
          title: 'V.O.B. 2023-01',
          steps: [{ status: 'Ontvangen', isActive: true }],
          link: { to: '/test', title: 'Test' },
        },
      ];
      (fetchVergunningen as unknown as Mock).mockResolvedValue(
        apiSuccessResult(vergunningen)
      );

      const result = await fetchVergunningenNotifications(authProfileAndToken);
      expect(result.status).toBe('OK');
      expect(result.content?.notifications).toHaveLength(1);
      expect(result.content?.notifications[0]).toHaveProperty(
        'title',
        'Aanvraag V.O.B. 2023-01 ontvangen'
      );
    });

    it('should return an error if fetchVergunningen fails', async () => {
      (fetchVergunningen as unknown as Mock).mockResolvedValue(
        apiErrorResult('Error fetching vergunningen', null)
      );

      const result = await fetchVergunningenNotifications(authProfileAndToken);
      expect(result.status).toBe('DEPENDENCY_ERROR');
    });
  });
});
