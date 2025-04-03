import { describe, it, expect, vi, Mock } from 'vitest';

import { fetchHorecaVergunningen, fetchHorecaNotifications } from './horeca';
import { getAuthProfileAndToken } from '../../../testing/utils';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  apiSuccessResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import { getVergunningNotifications } from '../vergunningen/vergunningen-notifications';
import {
  getDisplayStatus,
  getStatusSteps,
} from '../vergunningen/vergunningen-status-steps';

vi.mock('../decos/decos-service', () => ({
  fetchDecosZaken: vi.fn(),
  transformDecosZaakFrontend: vi.fn(),
}));

vi.mock('../vergunningen/vergunningen-notifications', () => ({
  getVergunningNotifications: vi.fn(),
}));

vi.mock('../vergunningen/vergunningen-status-steps', () => ({
  getDisplayStatus: vi.fn(),
  getStatusSteps: vi.fn(),
}));

describe('horeca', () => {
  const requestID = 'test-request-id';
  const authProfileAndToken = getAuthProfileAndToken();

  describe('fetchHorecaVergunningen', () => {
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

      const result = await fetchHorecaVergunningen(
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
        apiErrorResult('Error fetching Decos Zaken', null)
      );

      const result = await fetchHorecaVergunningen(
        requestID,
        authProfileAndToken
      );
      expect(result.status).toBe('ERROR');
    });
  });

  describe('fetchHorecaNotifications', () => {
    it('should return empty notifications if feature toggle is off', async () => {
      FeatureToggle.horecaActive = false;

      const result = await fetchHorecaNotifications(
        requestID,
        authProfileAndToken
      );
      expect(result.status).toBe('OK');
      expect(result.content?.notifications).toHaveLength(0);
    });

    it('should return notifications if fetchHorecaVergunningen is successful', async () => {
      FeatureToggle.horecaActive = true;
      (fetchDecosZaken as unknown as Mock).mockResolvedValue(
        apiSuccessResult([])
      );
      (getVergunningNotifications as Mock).mockReturnValue([
        'notification1',
        'notification2',
      ]);

      const result = await fetchHorecaNotifications(
        requestID,
        authProfileAndToken
      );
      expect(result.status).toBe('OK');
      expect(result.content?.notifications).toHaveLength(2);
    });

    it('should return an error if fetchHorecaVergunningen fails', async () => {
      FeatureToggle.horecaActive = true;
      (fetchDecosZaken as unknown as Mock).mockResolvedValue(
        apiErrorResult('failed to fetch vergunningen', null)
      );
      const result = await fetchHorecaNotifications(
        requestID,
        authProfileAndToken
      );
      expect(result.status).toBe('DEPENDENCY_ERROR');
    });
  });
});
