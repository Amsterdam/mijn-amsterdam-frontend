import MockDate from 'mockdate';
import { afterAll, describe, expect, it } from 'vitest';

import {
  DecosVarenZaakVergunning,
  VarenVergunningExploitatieType,
} from './config-and-types';
import { fetchVaren } from './varen';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { omit } from '../../../universal/helpers/utils';
import * as decos from '../decos/decos-service';

const vergunning1 = {
  vesselLength: '2,31',
  vesselWidth: '2,32',
  segment: 'Onbemand',
  eniNumber: '7654321',
  id: 'Z-25-0000001-10001',
  vesselName: 'Titanic',
  identifier: 'Z/25/0000001',
} as DecosVarenZaakVergunning;

const vergunning2 = {
  vesselLength: '2,31',
  vesselWidth: '2,32',
  segment: 'Onbemand',
  eniNumber: '12345678',
  id: 'Z-25-0000002-10002',
  vesselName: 'Titanic 2',
  identifier: 'Z/25/0000002',
} as DecosVarenZaakVergunning;

const zakenContent = [
  {
    id: 'Z-24-0000001',
    identifier: 'Z/24/0000001',
    key: 'ABCDEF0123456789ABCDEF0123456789',
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    decision: 'Verleend',
    processed: true,
    linkDataRequest: 'https://test.test',
    vesselName: 'Titanic',
    vesselLength: '2,31',
    vesselWidth: '2,32',
    segment: 'Onbemand',
    statusDates: [],
    termijnDates: [],
    dateRequest: '2025-01-01T00:00:00',
    dateDecision: '2025-01-03T00:00:00',
    vergunningen: [vergunning1, vergunning2],
  } satisfies Partial<VarenVergunningExploitatieType>,
] as unknown as VarenVergunningExploitatieType[];

describe('Varen service', () => {
  const authProfileAndToken = getAuthProfileAndToken();

  MockDate.set('2022-10-06');

  afterAll(() => {
    MockDate.reset();
  });

  describe('fetchVaren', () => {
    it('should respond with a success response on empty zaken list', async () => {
      vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValueOnce(
        apiSuccessResult([])
      );

      const response = await fetchVaren(authProfileAndToken);
      const successResponse = {
        status: 'OK',
        content: {
          reder: null,
          zaken: [],
        },
      };
      expect(response).toStrictEqual(successResponse);
    });

    it('should respond with an error response if decos fetchDecosZaken returns an error', async () => {
      vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValueOnce(
        apiErrorResult('Error', null)
      );

      const response = await fetchVaren(authProfileAndToken);
      const errorResponse = {
        content: null,
        message: 'Error',
        status: 'ERROR',
      };
      expect(response).toStrictEqual(errorResponse);
    });

    it('should return a list of VarenFrontend zaken', async () => {
      vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValueOnce(
        apiSuccessResult(zakenContent)
      );

      const response = await fetchVaren(authProfileAndToken);
      expect(response.status).toBe('OK');
      expect(response.content?.zaken[0]).toStrictEqual({
        ...omit(zakenContent[0], [
          'statusDates',
          'termijnDates',
          'vergunningen',
        ]),
        displayStatus: 'Verleend',
        fetchSourceRaw:
          'http://bff-api-host/api/v1/services/decos/zaak-raw?key=ABCDEF0123456789ABCDEF0123456789',
        id: 'Z-25-0000001-10001',
        identifier: 'Z/24/0000001',
        dateRequestFormatted: '01 januari 2025',
        dateDecisionFormatted: '03 januari 2025',
        vergunning: vergunning1,
        vesselName: vergunning1.vesselName,
        steps: [
          {
            datePublished: '2025-01-01T00:00:00',
            description: '',
            id: 'step-0',
            isActive: false,
            isChecked: true,
            status: 'Ontvangen',
          },
          {
            datePublished: '2025-01-01T00:00:00',
            description: '',
            id: 'step-1',
            isActive: false,
            isChecked: true,
            status: 'In behandeling',
          },
          {
            datePublished: '2025-01-03T00:00:00',
            id: 'step-2',
            isActive: true,
            isChecked: true,
            status: 'Afgehandeld',
          },
        ],
        link: {
          title: 'Bekijk hoe het met uw aanvraag staat',
          to: '/passagiers-en-beroepsvaart/vergunning/varen-vergunning-exploitatie/Z-25-0000001-10001',
        },
      });
      expect(response.content?.zaken[1]).toMatchObject({
        id: 'Z-25-0000002-10002',
        identifier: 'Z/24/0000001',
        vergunning: vergunning2,
        vesselName: vergunning2.vesselName,
      });
    });

    it('should return a list of a single VarenFrontend zaak when no vergunning is linked', async () => {
      const zakenContentWithoutVergunning = [
        {
          ...zakenContent[0],
          vergunningen: [],
          status: 'In behandeling',
          decision: null,
          processed: false,
        },
      ];

      vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValueOnce(
        apiSuccessResult(zakenContentWithoutVergunning)
      );

      const response = await fetchVaren(authProfileAndToken);
      expect(response.status).toBe('OK');
      expect(response.content?.zaken).toHaveLength(1);
      expect(response.content?.zaken[0]).toMatchObject({
        id: 'Z-24-0000001',
        identifier: 'Z/24/0000001',
      });
    });
  });
});
