import { describe, it, expect, vi, type Mock } from 'vitest';

import { DecosVergunning } from './config-and-types';
import { forTesting } from './vergunningen';
import { routeConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import { getAuthProfileAndToken } from '../../../testing/utils';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import type { DecosZaakBase } from '../decos/decos-types';

const { transformVergunningFrontend } = forTesting;

vi.mock('../../helpers/encrypt-decrypt');

vi.mock('../decos/decos-service', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchDecosZaken: vi.fn(),
}));

vi.mock('./vergunningen-status-steps', () => ({
  getStatusSteps: vi
    .fn()
    .mockReturnValue([{ status: 'FooBar', isActive: true }]),
}));

describe('vergunningen', () => {
  const authProfileAndToken = getAuthProfileAndToken();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  (encryptSessionIdWithRouteIdParam as Mock).mockReturnValue('xxx');

  describe('transformVergunningFrontend', () => {
    it('should correctly transform a DecosVergunning into a VergunningFrontend', () => {
      const decosVergunning: DecosZaakBase = {
        id: '1',
        caseType: '',
        dateDecision: null,
        dateRequest: '',
        dateStart: null,
        dateEnd: null,
        decision: null,
        identifier: 'Z/123/123',
        title: '',
        key: '',
        processed: false,
        statusDates: [],
        termijnDates: [],
        isVerleend: false,
      };

      const result = transformVergunningFrontend(
        authProfileAndToken.profile.sid,
        decosVergunning as DecosVergunning,
        routeConfig.detailPage.path
      );
      expect(result).toStrictEqual({
        caseType: '',
        dateDecision: null,
        dateDecisionFormatted: null,
        dateEnd: null,
        dateRequest: '',
        dateRequestFormatted: '',
        dateStart: null,
        decision: null,
        displayStatus: 'FooBar',
        fetchDocumentsUrl:
          'http://bff-api-host/api/v1/services/decos/documents?id=xxx',
        id: '1',
        identifier: 'Z/123/123',
        isVerleend: false,
        key: '',
        link: {
          title: 'Bekijk hoe het met uw aanvraag staat',
          to: '/vergunningen/1',
        },
        processed: false,
        steps: [{ status: 'FooBar', isActive: true }],
        title: '',
      });
    });
  });
});
