import { describe, it, expect, vi, Mock } from 'vitest';

import { fetchVaren_, transformVarenFrontend } from './varen';
import { getStatusSteps } from './varen-status-steps';
import { AppRoutes } from '../../../universal/config/routes';
import {
  apiSuccessResult,
  apiDependencyError,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';

vi.mock('../decos/decos-service', () => ({
  fetchDecosZaken: vi.fn(),
  transformDecosZaakFrontend: vi.fn(),
}));

vi.mock('./varen-status-steps', () => ({
  getStatusSteps: vi.fn(),
}));

describe('varen', () => {
  const requestID = 'test-request-id';
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { id: 'test-id', profileType: 'private', sid: 'test-sid' },
    token: 'test-token',
  };

  describe('transformVarenFrontend', () => {
    it('should correctly transform a Varen into a VarenFrontend', () => {
      const varen = { id: '1' };
      (transformDecosZaakFrontend as Mock).mockImplementation(
        (sid, appRoute, vergunning) => ({
          ...vergunning,
          transformed: true,
        })
      );
      (getStatusSteps as Mock).mockReturnValue(['step1', 'step2']);

      const result = transformVarenFrontend(
        authProfileAndToken.profile.sid,
        AppRoutes['VAREN/DETAIL'],
        varen
      );
      expect(result).toHaveProperty('transformed', true);
      expect(result).toHaveProperty('steps', ['step1', 'step2']);
    });
  });

  describe('fetchVaren_', () => {
    it('should return transformed vergunningen if fetchDecosZaken is successful', async () => {
      const decosVergunningen = [{ id: '1' }, { id: '2' }];
      (fetchDecosZaken as Mock).mockResolvedValue(
        apiSuccessResult(decosVergunningen)
      );
      (transformDecosZaakFrontend as Mock).mockImplementation(
        (sid, appRoute, vergunning) => ({
          ...vergunning,
          transformed: true,
        })
      );
      (getStatusSteps as Mock).mockReturnValue(['step1', 'step2']);

      const result = await fetchVaren_(requestID, authProfileAndToken);
      expect(result.status).toBe('OK');
      expect(result.content).toHaveLength(2);
      expect(result.content[0]).toHaveProperty('transformed', true);
      expect(result.content[0]).toHaveProperty('steps', ['step1', 'step2']);
    });

    it('should return an error if fetchDecosZaken fails', async () => {
      (fetchDecosZaken as Mock).mockResolvedValue(
        apiDependencyError('Error fetching Decos Zaken')
      );

      const result = await fetchVaren_(requestID, authProfileAndToken);
      expect(result.status).toBe('ERROR');
    });
  });
});
