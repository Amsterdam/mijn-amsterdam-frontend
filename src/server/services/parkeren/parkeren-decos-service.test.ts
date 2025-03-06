import { describe, it, expect, vi, Mock } from 'vitest';

import { fetchDecosParkeerVergunningen } from './parkeren-decos-service';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import {
  getStatusSteps,
  getDisplayStatus,
} from '../vergunningen/vergunningen-status-steps';

vi.mock('../decos/decos-service', () => ({
  fetchDecosZaken: vi.fn(),
  transformDecosZaakFrontend: vi.fn(),
}));

vi.mock('../vergunningen/vergunningen-status-steps', () => ({
  getStatusSteps: vi.fn(),
  getDisplayStatus: vi.fn(),
}));

describe('parkeren-decos-service', () => {
  const requestID = 'test-request-id';
  const authProfileAndToken = getAuthProfileAndToken();

  describe('fetchDecosParkeerVergunningen', () => {
    it('should return transformed vergunningen if fetchDecosZaken is successful', async () => {
      const decosVergunningen = [{ id: '1' }, { id: '2' }];
      (fetchDecosZaken as unknown as Mock).mockResolvedValue(
        apiSuccessResult(decosVergunningen)
      );
      (transformDecosZaakFrontend as Mock).mockImplementation(
        (_sid, vergunning) => ({
          ...vergunning,
          transformed: true,
        })
      );
      (getStatusSteps as Mock).mockReturnValue(['step1', 'step2']);
      (getDisplayStatus as Mock).mockReturnValue('displayStatus');

      const result = await fetchDecosParkeerVergunningen(
        requestID,
        authProfileAndToken
      );
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
        apiErrorResult('Error fetching Decos zaken', null)
      );

      const result = await fetchDecosParkeerVergunningen(
        requestID,
        authProfileAndToken
      );
      expect(result.status).toBe('ERROR');
    });
  });
});
