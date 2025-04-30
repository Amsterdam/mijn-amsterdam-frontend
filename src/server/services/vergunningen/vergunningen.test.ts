import { describe, it, expect, vi } from 'vitest';

import { DecosVergunning } from './config-and-types';
import { forTesting } from './vergunningen';
import { routeConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import { getAuthProfileAndToken } from '../../../testing/utils';
import type { DecosZaakBase } from '../decos/decos-types';

const { transformVergunningFrontend, fetchVergunningen_ } = forTesting;

vi.mock('../decos/decos-service', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchDecosZaken: vi.fn(),
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
      };

      const result = transformVergunningFrontend(
        authProfileAndToken.profile.sid,
        decosVergunning as DecosVergunning,
        routeConfig.detailPage.path
      );
      expect(result).toMatchInlineSnapshot(`
        {
          "caseType": "",
          "dateDecision": null,
          "dateDecisionFormatted": null,
          "dateEnd": null,
          "dateRequest": "",
          "dateRequestFormatted": "",
          "dateStart": null,
          "decision": null,
          "displayStatus": "Onbekend",
          "fetchDocumentsUrl": "http://bff-api-host/api/v1/services/decos/documents?id=qcLJWzx1u-mc03fDZ6T8V9JO3-mzaZ-P0dbS3clddmKaBUivRNOJU0m-nMyMSfBt",
          "id": "1",
          "identifier": "Z/123/123",
          "key": "",
          "link": {
            "title": "Bekijk hoe het met uw aanvraag staat",
            "to": "/vergunningen/1",
          },
          "processed": false,
          "steps": [],
          "title": "",
        }
      `);
    });
  });

  // describe('fetchVergunningen_', () => {
  //   it('should return transformed vergunningen if fetchDecosZaken is successful', async () => {
  //     const decosZaken = [{ id: '1' }, { id: '2' }];
  //     (fetchDecosZaken as unknown as Mock).mockResolvedValue(
  //       apiSuccessResult(decosZaken)
  //     );
  //     (transformDecosZaakFrontend as Mock).mockImplementation(
  //       (_sid, vergunning) => ({
  //         ...vergunning,
  //         transformed: true,
  //       })
  //     );

  //     const result = await fetchVergunningen_(requestID, authProfileAndToken);
  //     expect(result.status).toBe('OK');
  //     expect(result.content).toHaveLength(2);
  //     expect(result.content?.[0]).toHaveProperty('transformed', true);
  //     expect(result.content?.[0]).toHaveProperty('steps', ['step1', 'step2']);
  //     expect(result.content?.[0]).toHaveProperty(
  //       'displayStatus',
  //       'displayStatus'
  //     );
  //   });

  //   it('should return an error if fetchDecosZaken fails', async () => {
  //     (fetchDecosZaken as unknown as Mock).mockResolvedValue(
  //       apiErrorResult('Error fetching Decos Zaken', null)
  //     );

  //     const result = await fetchVergunningen_(requestID, authProfileAndToken);
  //     expect(result.status).toBe('ERROR');
  //   });
  // });
});
