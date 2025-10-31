import MockDate from 'mockdate';
import { afterAll, describe, expect, it } from 'vitest';

import {
  DecosVarenZaakVergunning,
  ZaakVergunningExploitatieType,
  VarenVergunningExploitatieType,
  ZaakVergunningExploitatieWijzigingVaartuigNaamType,
} from './config-and-types';
import { fetchVaren } from './varen';
import { getAuthProfileAndToken } from '../../../testing/utils';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { omit } from '../../../universal/helpers/utils';
import * as decos from '../decos/decos-service';

const vergunning = {
  vesselLength: '2,31',
  vesselWidth: '2,32',
  segment: 'Onbemand',
  eniNumber: '7654321',
  vesselName: 'Titanic',
  id: 'Z-25-0000001-10001',
  identifier: 'Z/25/0000001/10001',
} as DecosVarenZaakVergunning;

const vergunningContent = {
  ...vergunning,
  itemType: 'varens',
  caseType: null,
  title: 'Varen vergunning exploitatie',
  dateEnd: '2025-01-03T00:00:00',
} as unknown as VarenVergunningExploitatieType;

const zaakAanvraagExploitatie = {
  id: 'Z-24-0000001',
  identifier: 'Z/24/0000001',
  key: 'ABC',
  caseType: 'Varen vergunning exploitatie',
  title: 'Varen vergunning exploitatie',
  decision: null,
  processed: false,
  linkDataRequest: 'https://test.test',
  vesselName: 'Titanic',
  vesselLength: '2,31',
  vesselWidth: '2,32',
  segment: 'Onbemand',
  statusDates: [],
  termijnDates: [],
  dateRequest: '2025-01-01T00:00:00',
  vergunningen: [],
} satisfies Partial<ZaakVergunningExploitatieType> as unknown as ZaakVergunningExploitatieType;

const zaakWijzigingExploitatie = {
  id: 'Z-24-0000002',
  identifier: 'Z/24/0000002',
  key: 'ABC2',
  caseType: 'Varen vergunning exploitatie Wijziging vaartuignaam',
  title: 'Wijzigen: Vaartuig een andere naam geven',
  decision: null,
  processed: false,
  linkDataRequest: 'https://test.test',
  vesselName: 'Titanic Old',
  vesselNameNew: 'Titanic New',
  vesselLength: '2,31',
  vesselWidth: '2,32',
  segment: 'Onbemand',
  statusDates: [],
  termijnDates: [],
  dateRequest: '2025-01-01T00:00:00',
  vergunningen: [vergunning],
} satisfies Partial<ZaakVergunningExploitatieWijzigingVaartuigNaamType> as unknown as ZaakVergunningExploitatieType;

describe('Varen service', () => {
  const authProfileAndToken = getAuthProfileAndToken();

  MockDate.set('2022-10-06');

  afterAll(() => {
    MockDate.reset();
  });

  describe('fetchVaren', () => {
    it('should respond with a success response on empty zaken list', async () => {
      vi.spyOn(decos, 'fetchDecosZaken')
        .mockResolvedValueOnce(apiSuccessResult([]))
        .mockResolvedValueOnce(apiSuccessResult([]))
        .mockResolvedValueOnce(apiSuccessResult([]));

      const response = await fetchVaren(authProfileAndToken);
      const successResponse = {
        status: 'OK',
        content: {
          reder: null,
          zaken: [],
          vergunningen: [],
        },
      };
      expect(response).toStrictEqual(successResponse);
    });

    it('should respond with an error response if decos fetchDecosZaken returns an error', async () => {
      vi.spyOn(decos, 'fetchDecosZaken').mockResolvedValue(
        apiErrorResult('Error', null)
      );

      const response = await fetchVaren(authProfileAndToken);
      const errorResponse = {
        content: null,
        message: 'Failed dependencies',
        status: 'ERROR',
      };
      expect(response).toStrictEqual(errorResponse);
    });

    it('should return a list of VarenFrontend zaken', async () => {
      vi.spyOn(decos, 'fetchDecosZaken')
        .mockResolvedValueOnce(apiSuccessResult([]))
        .mockResolvedValueOnce(
          apiSuccessResult([zaakAanvraagExploitatie, zaakWijzigingExploitatie])
        )
        .mockResolvedValueOnce(apiSuccessResult([vergunningContent]));

      const response = await fetchVaren(authProfileAndToken);
      expect(response.status).toBe('OK');
      expect(response.content?.zaken[0]).toStrictEqual({
        ...omit(zaakAanvraagExploitatie, [
          'statusDates',
          'termijnDates',
          'vergunningen',
        ]),
        displayStatus: 'In behandeling',
        fetchSourceRaw:
          'http://bff-api-host/api/v1/services/decos/zaak-raw?key=ABC',
        id: 'Z-24-0000001',
        identifier: 'Z/24/0000001',
        dateRequestFormatted: '01 januari 2025',
        dateDecisionFormatted: null,
        vergunning: null,
        vesselName: zaakAanvraagExploitatie.vesselName,
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
            isActive: true,
            isChecked: false,
            status: 'In behandeling',
          },
          {
            datePublished: '',
            id: 'step-2',
            isActive: false,
            isChecked: false,
            status: 'Afgehandeld',
            description: '',
          },
        ],
        link: {
          title: 'Bekijk hoe het met uw aanvraag staat',
          to: '/varen/vergunningen/varen-vergunning-exploitatie/Z-24-0000001',
        },
      });
      expect(response.content?.zaken[1]).toMatchObject({
        id: 'Z-24-0000002',
        identifier: 'Z/24/0000002',
        vergunning: zaakWijzigingExploitatie.vergunningen[0],
        vesselName: zaakWijzigingExploitatie.vesselName,
      });
    });

    it('should return a list of a single vergunning with linkedActiveZaak', async () => {
      vi.spyOn(decos, 'fetchDecosZaken')
        .mockResolvedValueOnce(apiSuccessResult([]))
        .mockResolvedValueOnce(apiSuccessResult([zaakWijzigingExploitatie]))
        .mockResolvedValueOnce(apiSuccessResult([vergunningContent]));

      const response = await fetchVaren(authProfileAndToken);
      expect(response.status).toBe('OK');
      expect(response.content?.vergunningen).toHaveLength(1);
      expect(response.content?.vergunningen[0]).toMatchObject({
        id: 'Z-25-0000001-10001',
        identifier: 'Z/25/0000001/10001',
        linkedActiveZaakLink: {
          title: 'Bekijk hoe het met uw aanvraag staat',
          to: '/varen/vergunningen/varen-vergunning-exploitatie-wijziging-vaartuignaam/Z-24-0000002',
        },
      });
    });
  });
});
