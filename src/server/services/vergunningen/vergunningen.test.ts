import { describe, it, expect, vi, Mock } from 'vitest';

import { DecosVergunning } from './config-and-types';
import { forTesting } from './vergunningen';
import { getStatusSteps, getDisplayStatus } from './vergunningen-status-steps';
import { routeConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';

const { transformVergunningFrontend, fetchVergunningen_ } = forTesting;

vi.mock('../decos/decos-service', () => ({
  fetchDecosZaken: vi.fn(),
  transformDecosZaakFrontend: vi.fn(),
}));

vi.mock('./vergunningen-status-steps', () => ({
  getStatusSteps: vi.fn(),
  getDisplayStatus: vi.fn(),
}));

describe('vergunningen', () => {
  const requestID = 'test-request-id';
  const authProfileAndToken = getAuthProfileAndToken();

  describe('transformVergunningFrontend', () => {
    it('should correctly transform a DecosVergunning into a VergunningFrontend', () => {
      const decosVergunning = { id: '1' };
      (transformDecosZaakFrontend as Mock).mockImplementation(
        (_sid, vergunning) => ({
          ...vergunning,
          transformed: true,
        })
      );
      (getStatusSteps as Mock).mockReturnValue(['step1', 'step2']);
      (getDisplayStatus as Mock).mockReturnValue('displayStatus');

      const result = transformVergunningFrontend(
        authProfileAndToken.profile.sid,
        decosVergunning as DecosVergunning,
        routeConfig.detailPage.path
      );
      expect(result).toHaveProperty('transformed', true);
      expect(result).toHaveProperty('steps', ['step1', 'step2']);
      expect(result).toHaveProperty('displayStatus', 'displayStatus');
    });
  });

  describe('fetchVergunningen_', () => {
    it('should return transformed vergunningen if fetchDecosZaken is successful', async () => {
      const decosZaken = [{ id: '1' }, { id: '2' }];
      (fetchDecosZaken as unknown as Mock).mockResolvedValue(
        apiSuccessResult(decosZaken)
      );
      (transformDecosZaakFrontend as Mock).mockImplementation(
        (_sid, vergunning) => ({
          ...vergunning,
          transformed: true,
        })
      );
      (getStatusSteps as Mock).mockReturnValue(['step1', 'step2']);
      (getDisplayStatus as Mock).mockReturnValue('displayStatus');

      const result = await fetchVergunningen_(requestID, authProfileAndToken);
      expect(result.status).toBe('OK');
      expect(result.content).toHaveLength(2);
      expect(result.content?.[0]).toHaveProperty('transformed', true);
      expect(result.content?.[0]).toHaveProperty('steps', ['step1', 'step2']);
      expect(result.content?.[0]).toHaveProperty(
        'displayStatus',
        'displayStatus'
      );
    });

    it('should return an error if fetchDecosZaken fails', async () => {
      (fetchDecosZaken as unknown as Mock).mockResolvedValue(
        apiErrorResult('Error fetching Decos Zaken', null)
      );

      const result = await fetchVergunningen_(requestID, authProfileAndToken);
      expect(result.status).toBe('ERROR');
    });
  });
});
