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
import { getStatusSteps } from '../vergunningen/vergunningen-status-steps';

vi.mock('../decos/decos-service', () => ({
  fetchDecosZaken: vi.fn(),
  transformDecosZaakFrontend: vi.fn(),
}));

vi.mock('../vergunningen/vergunningen-status-steps', () => ({
  getStatusSteps: vi.fn(),
  getDisplayStatus: vi.fn(),
}));

describe('parkeren-decos-service', () => {
  const authProfileAndToken = getAuthProfileAndToken();

  describe('fetchDecosParkeerVergunningen', () => {
    it('should return transformed vergunningen if fetchDecosZaken is successful', async () => {
      const decosZaken = [{ id: '1' }, { id: '2' }];

      (fetchDecosZaken as unknown as Mock).mockResolvedValue(
        apiSuccessResult(decosZaken)
      );

      const result = await fetchDecosParkeerVergunningen(authProfileAndToken);

      expect(fetchDecosZaken).toHaveBeenCalledWith(
        authProfileAndToken,
        expect.anything() // decosZaakTransformers
      );

      expect(transformDecosZaakFrontend).toHaveBeenCalledWith(
        authProfileAndToken.profile.sid,
        decosZaken[0],
        expect.objectContaining({
          detailPageRoute: '/parkeren/:caseType/:id',
          includeFetchDocumentsUrl: true,
          getStepsFN: getStatusSteps,
        })
      );
      expect(transformDecosZaakFrontend).toHaveBeenCalledWith(
        authProfileAndToken.profile.sid,
        decosZaken[1],
        expect.objectContaining({
          detailPageRoute: '/parkeren/:caseType/:id',
          includeFetchDocumentsUrl: true,
          getStepsFN: getStatusSteps,
        })
      );
    });

    it('should return an error if fetchDecosZaken fails', async () => {
      (fetchDecosZaken as unknown as Mock).mockResolvedValue(
        apiErrorResult('Error fetching Decos zaken', null)
      );

      const result = await fetchDecosParkeerVergunningen(authProfileAndToken);
      expect(result.status).toBe('ERROR');
    });
  });
});
