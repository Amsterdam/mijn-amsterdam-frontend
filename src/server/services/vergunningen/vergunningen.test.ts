import { describe, it, expect, vi, type Mock } from 'vitest';

import type { DecosVergunning } from './config-and-types.ts';
import { getStatusStepsDecos } from './decos-status-steps.ts';
import { fetchVergunningen } from './vergunningen.ts';
import { themaConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config.ts';
import { getAuthProfileAndToken } from '../../../testing/utils.ts';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt.ts';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service.ts';
import type { DecosZaakBase } from '../decos/decos-types.ts';
import { fetchPBZaken } from '../powerbrowser/powerbrowser-service.ts';

vi.mock('../../helpers/encrypt-decrypt');

vi.mock(
  '../decos/decos-service',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (importOriginal: () => Promise<any>) => ({
    ...(await importOriginal()),
    fetchDecosZaken: vi.fn(),
  })
);

vi.mock('../powerbrowser/powerbrowser-service', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchPBZaken: vi.fn(),
}));

vi.mock('./decos-status-steps', () => ({
  getStatusStepsDecos: vi
    .fn()
    .mockReturnValue([{ status: 'FooBar', isActive: true }]),
}));

vi.mock('./pb-status-steps', () => ({
  getStatusStepsPB: vi
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
          detailPageRoute: themaConfig.detailPage.route.path,
          includeFetchDocumentsUrl: true,
          getStepsFN: getStatusStepsDecos,
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

  it('should return combined vergunningen when both Decos and PB requests succeed', async () => {
    const mockDecosResponse = {
      status: 'OK',
      content: [{ id: '1', caseType: 'Decos Case 1' }],
    };
    const mockPBResponse = {
      status: 'OK',
      content: [{ id: '2', caseType: 'PB Case 1' }],
    };
    (fetchDecosZaken as Mock).mockResolvedValue(mockDecosResponse);
    (fetchPBZaken as Mock).mockResolvedValue(mockPBResponse);

    const result = await fetchVergunningen(authProfileAndToken);

    expect(result.status).toBe('OK');
    expect(result.content).toStrictEqual([
      expect.objectContaining({ caseType: 'Decos Case 1' }),
      expect.objectContaining({ caseType: 'PB Case 1' }),
    ]);
  });
});
