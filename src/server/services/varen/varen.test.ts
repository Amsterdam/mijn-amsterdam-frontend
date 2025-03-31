import MockDate from 'mockdate';
import { afterAll, describe, expect, it } from 'vitest';

import { VarenFrontend } from './config-and-types';
import { fetchVaren } from './varen';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
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
    permitReference: '123456789',
    statusDates: [],
    termijnDates: [],
    dateRequest: '2025-01-01T00:00:00',
    dateDecision: '2025-01-03T00:00:00',
  } satisfies Partial<VarenFrontend>,
] as unknown as VarenFrontend[];

describe('Varen service', () => {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private', id: '', sid: '' },
    token: 'xxxxxx',
  };

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
        content: [],
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
      const successResponse = {
        status: 'OK',
        content: [
          {
            caseType: 'Varen vergunning exploitatie',
            dateRequest: '2025-01-01T00:00:00',
            dateRequestFormatted: '01 januari 2025',
            dateDecision: '2025-01-03T00:00:00',
            dateDecisionFormatted: '03 januari 2025',
            decision: 'Verleend',
            displayStatus: 'Verleend',
            eniNumber: '7654321',
            id: 'Z-24-0000001',
            identifier: 'Z/24/3421790',
            key: 'ABCDEF0123456789ABCDEF0123456789',
            linkDataRequest: 'https://test.test',
            permitReference: '123456789',
            processed: true,
            segment: 'Onbemand',
            status: 'Afgehandeld',
            title: 'Varen vergunning exploitatie',
            vesselLength: '2,31',
            vesselName: 'Titanic',
            vesselWidth: '2,32',
            statusDates: [],
            termijnDates: [],
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
              to: '/passagiers-en-beroepsvaart/vergunning/varen-vergunning-exploitatie/Z-24-0000001',
            },
          },
        ],
      };
      expect(response).toStrictEqual(successResponse);
    });
  });
});
