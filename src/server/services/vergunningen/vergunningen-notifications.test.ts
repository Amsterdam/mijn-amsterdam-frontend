import { describe, it, expect, vi, Mock } from 'vitest';

import { VergunningFrontend } from './config-and-types';
import { fetchVergunningen } from './vergunningen';
import { isNearEndDate } from './vergunningen-helpers';
import {
  getNotificationLabels,
  createVergunningNotification,
  getVergunningNotifications,
  fetchVergunningenNotifications,
} from './vergunningen-notifications';
import { getAuthProfileAndToken } from '../../../testing/utils';
import { Themas } from '../../../universal/config/thema';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import { isRecentNotification } from '../../../universal/helpers/utils';
import { DecosZaakBase, DecosZaakTransformer } from '../decos/config-and-types';

vi.mock('./vergunningen', () => ({
  fetchVergunningen: vi.fn(),
}));

vi.mock('./vergunningen-helpers', () => ({
  isNearEndDate: vi.fn(),
}));

vi.mock('../../../universal/helpers/utils', () => ({
  isRecentNotification: vi.fn(),
}));

describe('vergunningen-notifications', () => {
  describe('getNotificationLabels', () => {
    it('should return correct label for verlooptBinnenkort', () => {
      const vergunning = {
        decision: 'Verleend',
        dateEnd: '2023-12-01',
      } as VergunningFrontend;
      (isNearEndDate as Mock).mockReturnValue(true);

      const labels = getNotificationLabels(
        { verlooptBinnenkort: 'Verloopt binnenkort' } as any,
        vergunning
      );
      expect(labels).toBe('Verloopt binnenkort');
    });

    it('should return correct label for isVerlopen', () => {
      const vergunning = {
        decision: 'Verleend',
        isExpired: true,
        dateEnd: '2023-01-01',
      } as VergunningFrontend;
      (isNearEndDate as Mock).mockReturnValue(false);
      (isRecentNotification as Mock).mockReturnValue(true);

      const labels = getNotificationLabels(
        { isVerlopen: 'Is verlopen' } as any,
        vergunning
      );
      expect(labels).toBe('Is verlopen');
    });

    it('should return correct label for isIngetrokken', () => {
      const vergunning = {
        decision: 'Ingetrokken',
        dateDecision: '2023-01-01',
      } as VergunningFrontend;
      (isRecentNotification as Mock).mockReturnValue(true);

      const labels = getNotificationLabels(
        { isIngetrokken: 'Is ingetrokken' } as any,
        vergunning
      );
      expect(labels).toBe('Is ingetrokken');
    });

    it('should return correct label for statusAfgehandeld', () => {
      const vergunning = {
        processed: true,
        dateDecision: '2023-01-01',
      } as VergunningFrontend;
      (isRecentNotification as Mock).mockReturnValue(true);

      const labels = getNotificationLabels(
        { statusAfgehandeld: 'Afgehandeld' } as any,
        vergunning
      );
      expect(labels).toBe('Afgehandeld');
    });

    it('should return correct label for statusInBehandeling', () => {
      const vergunning = {
        processed: false,
        steps: [{ status: 'In behandeling' }],
      } as VergunningFrontend;

      const labels = getNotificationLabels(
        { statusInBehandeling: 'In behandeling' } as any,
        vergunning
      );
      expect(labels).toBe('In behandeling');
    });

    it('should return correct label for statusAanvraag', () => {
      const vergunning = {
        processed: false,
      } as VergunningFrontend;

      const labels = getNotificationLabels(
        { statusAanvraag: 'Aanvraag' } as any,
        vergunning
      );
      expect(labels).toBe('Aanvraag');
    });

    it('should return null if no matching label', () => {
      const vergunning = {
        processed: false,
      } as VergunningFrontend;

      const labels = getNotificationLabels({}, vergunning);
      expect(labels).toBeNull();
    });
  });

  describe('createVergunningNotification', () => {
    it('should create a notification with valid labels', () => {
      const vergunning = {
        id: '1',
        caseType: 'TestCase',
        link: { to: '/test', title: 'Test' },
      } as VergunningFrontend;

      const zaakTypeTransformer = {
        caseType: 'TestCase',
        notificationLabels: {
          statusAanvraag: {
            title: () => 'Test Title',
            description: () => 'Test Description',
            datePublished: () => '2023-01-01',
            link: () => ({ to: '/test', title: 'Test' }),
          },
        },
      } as unknown as DecosZaakTransformer<DecosZaakBase>;

      const notification = createVergunningNotification(
        vergunning,
        zaakTypeTransformer,
        Themas.VERGUNNINGEN
      );
      expect(notification).toHaveProperty('title', 'Test Title');
      expect(notification).toHaveProperty('description', 'Test Description');
      expect(notification).toHaveProperty('datePublished', '2023-01-01');
      expect(notification).toHaveProperty('link', {
        to: '/test',
        title: 'Test',
      });
    });

    it('should return null if no notification labels', () => {
      const vergunning = {
        id: '1',
        caseType: 'TestCase',
        link: { to: '/test', title: 'Test' },
      } as VergunningFrontend;

      const zaakTypeTransformer = {
        caseType: 'TestCase',
        notificationLabels: null,
      } as unknown as DecosZaakTransformer<DecosZaakBase>;

      const notification = createVergunningNotification(
        vergunning,
        zaakTypeTransformer,
        Themas.VERGUNNINGEN
      );
      expect(notification).toBeNull();
    });
  });

  describe('getVergunningNotifications', () => {
    it('should return notifications for valid vergunningen and transformers', () => {
      const vergunningen = [
        {
          id: '1',
          caseType: 'TestCase',
          steps: [],
          link: { to: '/test', title: 'Test' },
        },
        {
          id: '2',
          caseType: 'TestCase',
          dateRequest: '2023-01-01',
          steps: [{ status: 'In behandeling' }],
          link: { to: '/test', title: 'Test' },
        },
        {
          id: '3',
          caseType: 'TestCase',
          decision: 'Verleend',
          processed: true,
          dateDecision: '2025-01-01',
          steps: [],
          link: { to: '/test', title: 'Test' },
        },
      ] as unknown as VergunningFrontend[];

      const decosZaakTransformers = [
        {
          caseType: 'TestCase',
          notificationLabels: {
            statusAanvraag: {
              title: () => 'Aanvraag',
              description: () => 'Test Description',
              datePublished: () => '2023-01-01',
              link: () => ({ to: '/test', title: 'Test' }),
            },
            statusInBehandeling: {
              title: () => 'In behandeling',
              description: () => 'Test Description',
              datePublished: () => '2023-01-01',
              link: () => ({ to: '/test', title: 'Test' }),
            },
            statusAfgehandeld: {
              title: () => 'Afgehandeld',
              description: () => 'Test Description',
              datePublished: () => '2023-01-01',
              link: () => ({ to: '/test', title: 'Test' }),
            },
          },
        },
      ] as unknown as DecosZaakTransformer<DecosZaakBase>[];

      const notifications = getVergunningNotifications(
        vergunningen,
        decosZaakTransformers,
        Themas.VERGUNNINGEN
      );
      expect(notifications).toHaveLength(3);
      expect(notifications[0]).toHaveProperty('title', 'Aanvraag');
      expect(notifications[1]).toHaveProperty('title', 'In behandeling');
      expect(notifications[2]).toHaveProperty('title', 'Afgehandeld');
    });

    it('should return empty array if no matching transformers', () => {
      const vergunningen = [
        { id: '1', caseType: 'TestCase', link: { to: '/test', title: 'Test' } },
      ] as VergunningFrontend[];

      const decosZaakTransformers: DecosZaakTransformer<DecosZaakBase>[] = [];

      const notifications = getVergunningNotifications(
        vergunningen,
        decosZaakTransformers,
        Themas.VERGUNNINGEN
      );
      expect(notifications).toHaveLength(0);
    });
  });

  describe('fetchVergunningenNotifications', () => {
    const requestID = 'test-request-id';
    const authProfileAndToken = getAuthProfileAndToken();

    it('should return notifications if fetchVergunningen is successful', async () => {
      const vergunningen = [
        {
          id: '1',
          caseType: 'VOB',
          title: 'V.O.B. 2023-01',
          steps: [],
          link: { to: '/test', title: 'Test' },
        },
      ];
      (fetchVergunningen as unknown as Mock).mockResolvedValue(
        apiSuccessResult(vergunningen)
      );

      const result = await fetchVergunningenNotifications(
        requestID,
        authProfileAndToken
      );
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

      const result = await fetchVergunningenNotifications(
        requestID,
        authProfileAndToken
      );
      expect(result.status).toBe('DEPENDENCY_ERROR');
    });
  });
});
