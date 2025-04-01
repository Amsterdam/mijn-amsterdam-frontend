import MockDate from 'mockdate';
import { afterAll, describe, expect, it } from 'vitest';

import { VarenVergunningExploitatieType } from './config-and-types';
import { fetchVaren } from './varen';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { omit } from '../../../universal/helpers/utils';
import * as decos from '../decos/decos-service';

const zakenContent = [
  {
    id: 'Z-24-0000001',
    identifier: 'Z/24/3421790',
    key: 'ABCDEF0123456789ABCDEF0123456789',
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    status: 'Afgehandeld',
    decision: 'Verleend',
    processed: true,
    linkDataRequest: 'https://test.test',
    vesselName: 'Titanic',
    vesselLength: '2,31',
    vesselWidth: '2,32',
    segment: 'Onbemand',
    eniNumber: '7654321',
    vergunningKenmerk: '123456789',
    statusDates: [],
    termijnDates: [],
    dateRequest: '2025-01-01T00:00:00',
    dateDecision: '2025-01-03T00:00:00',
    vergunningen: [
      {
        vesselLength: '2,31',
        vesselWidth: '2,32',
        segment: 'Onbemand',
        eniNumber: '7654321',
        id: 'Z-25-0000001-10001',
        vesselName: 'Titanic',
        vergunningKenmerk: 'Z/25/0000001',
      },
      {
        vesselLength: '2,31',
        vesselWidth: '2,32',
        segment: 'Onbemand',
        eniNumber: '12345678',
        id: 'Z-25-0000002-10002',
        vesselName: 'Titanic 2',
        vergunningKenmerk: 'Z/25/0000002',
      },
    ],
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

      const response = await fetchVaren('x1', authProfileAndToken);
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

      const response = await fetchVaren('x2', authProfileAndToken);
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

      const response = await fetchVaren('x3', authProfileAndToken);
      expect(response.status).toBe('OK');
      expect(response.content?.zaken[0]).toStrictEqual({
        ...omit(zakenContent[0], [
          'statusDates',
          'termijnDates',
          'vergunningen',
        ]),
        ...{
          id: 'Z-24-0000001-Z-25-0000001-10001',
          vergunningKenmerk: 'Z/25/0000001',
          dateRequestFormatted: '01 januari 2025',
          dateDecisionFormatted: '03 januari 2025',
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
            to: '/passagiers-en-beroepsvaart/vergunning/varen-vergunning-exploitatie/Z-24-0000001-Z-25-0000001-10001',
          },
        },
      });
      expect(response.content?.zaken[1]).toMatchObject({
        id: 'Z-24-0000001-Z-25-0000002-10002',
        vergunningKenmerk: 'Z/25/0000002',
        eniNumber: '12345678',
        vesselName: 'Titanic 2',
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

      const response = await fetchVaren('x4', authProfileAndToken);
      expect(response.status).toBe('OK');
      expect(response.content?.zaken).toHaveLength(1);
      expect(response.content?.zaken[0]).toMatchObject({
        id: 'Z-24-0000001',
        vergunningKenmerk: '123456789',
      });
    });
  });
});
