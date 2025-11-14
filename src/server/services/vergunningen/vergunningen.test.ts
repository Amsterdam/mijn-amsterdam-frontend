import { describe, it, expect, vi, type Mock } from 'vitest';

import { DecosVergunning } from './config-and-types';
import { getStatusSteps } from './vergunningen-status-steps';
import { routeConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import { getAuthProfileAndToken } from '../../../testing/utils';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { transformDecosZaakFrontend } from '../decos/decos-service';
import type { DecosZaakBase } from '../decos/decos-types';

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
        itemType: 'folders',
        caseType: 'Case Type 1',
        dateDecision: null,
        dateRequest: '',
        dateStart: null,
        dateEnd: null,
        decision: null,
        identifier: 'Z/123/123',
        title: '',
        key: 'x1',
        processed: false,
        statusDates: [],
        termijnDates: [],
        isVerleend: false,
      };

      const result = transformDecosZaakFrontend<DecosVergunning>(
        authProfileAndToken.profile.sid,
        decosVergunning as DecosVergunning,
        {
          detailPageRoute: routeConfig.detailPage.path,
          includeFetchDocumentsUrl: true,
          getStepsFN: getStatusSteps,
        }
      );

      expect(result).toStrictEqual({
        itemType: 'folders',
        caseType: 'Case Type 1',
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
        fetchSourceRaw:
          'http://bff-api-host/api/v1/services/decos/zaak-raw?key=x1',
        id: '1',
        identifier: 'Z/123/123',
        isVerleend: false,
        key: 'x1',
        link: {
          title: 'Bekijk hoe het met uw aanvraag staat',
          to: '/vergunningen/case-type-1/1',
        },
        processed: false,
        steps: [{ status: 'FooBar', isActive: true }],
        title: '',
      });
    });
  });
});
