import Mockdate from 'mockdate';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  fetchActueleWRAVoorzieningenCompact,
  fetchWmo,
  fetchWmoVoorzieningenCompact,
  forTesting,
} from './wmo';
import { routes } from './wmo-service-config';
import ZORGNED_AANVRAGEN_WMO from '../../../../mocks/fixtures/zorgned-jzd-aanvragen.json';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { jsonCopy } from '../../../universal/helpers/utils';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types';
import {
  getHulpmiddelenDisclaimer,
  HulpmiddelenDisclaimerConfig,
} from './status-line-items/wmo-hulpmiddelen';

vi.mock('../../../server/helpers/encrypt-decrypt', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  encryptSessionIdWithRouteIdParam: vi.fn().mockReturnValue('123-123-123-123'),
}));

describe('Transform api items', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    Mockdate.set('2023-11-23');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  test('fetchWmo', async () => {
    remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_AANVRAGEN_WMO);

    expect(await fetchWmo(getAuthProfileAndToken())).toMatchSnapshot();
  });

  describe('getDocuments', () => {
    const aanvraag = {
      datumAanvraag: '2024-06-14',
      documenten: [
        {
          id: 'document-1',
          title: 'Document 1',
          datePublished: '2024-06-24',
          url: '',
        },
      ],
    } as ZorgnedAanvraagTransformed;

    test('Assign documents after MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(
        forTesting.getDocuments(
          'xxx-222',
          jsonCopy(aanvraag),
          routes.protected.WMO_DOCUMENT_DOWNLOAD
        )
      ).toMatchInlineSnapshot(`
          [
            {
              "datePublished": "2024-06-24",
              "id": "document-1",
              "title": "Document 1",
              "url": "http://bff-api-host/api/v1/services/wmo/document?id=123-123-123-123",
            },
          ]
        `);
    });

    test('Assign documents before MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(
        forTesting.getDocuments(
          'xxx-222',
          jsonCopy({ ...aanvraag, datumAanvraag: '2017-04-12' }),
          routes.protected.WMO_DOCUMENT_DOWNLOAD
        )
      ).toMatchInlineSnapshot(`[]`);
    });

    test('Assign documents with multiple docs after MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      const aanvraag2: ZorgnedAanvraagTransformed = jsonCopy(aanvraag);

      aanvraag2.documenten[1] = aanvraag2.documenten[0];

      expect(aanvraag2.documenten.length).toBe(2);

      expect(
        forTesting.getDocuments(
          'xxx-222',
          aanvraag2,
          routes.protected.WMO_DOCUMENT_DOWNLOAD
        )
      ).toMatchInlineSnapshot(`
        [
          {
            "datePublished": "2024-06-24",
            "id": "document-1",
            "title": "Document 1",
            "url": "http://bff-api-host/api/v1/services/wmo/document?id=123-123-123-123",
          },
          {
            "datePublished": "2024-06-24",
            "id": "document-1",
            "title": "Document 1",
            "url": "http://bff-api-host/api/v1/services/wmo/document?id=123-123-123-123",
          },
        ]
      `);
    });
  });

  describe('getHulpmiddelenDisclaimer', () => {
    const baseAanvraag: ZorgnedAanvraagTransformed = {
      titel: 'Test Voorziening',
      isActueel: true,
      datumEindeGeldigheid: null,
      datumIngangGeldigheid: null,
      datumAanvraag: '2024-01-01',
      datumBesluit: '2024-01-01',
      datumBeginLevering: '2024-01-01',
      datumEindeLevering: '2024-01-01',
      datumToewijzing: '2024-01-01',
      datumOpdrachtLevering: '2024-01-01',
      leverancier: 'Test Leverancier',
      leveringsVorm: 'Test LeveringsVorm',
      productsoortCode: 'Test ProductSoortCode',
      productIdentificatie: 'Test ProductIdentificatie',
      resultaat: 'toegewezen',
      betrokkenen: [],
      documenten: [],
      id: 'test-id',
      beschiktProductIdentificatie: '',
      beschikkingNummer: null,
      procesAanvraagOmschrijving: null,
      prettyID: '',
    };

    const CODE_A = 'codeA';
    const CODE_A_DATE_PAIR = {
      datumEindeGeldigheid: '31-12-2025',
      datumIngangGeldigheid: '2026-01-01',
    };

    const config: HulpmiddelenDisclaimerConfig = [
      {
        codes: [],
        actual: 'actual generic text',
        notActual: 'notActual generic text',
        datePairs: [
          {
            datumEindeGeldigheid: '2024-10-31',
            datumIngangGeldigheid: '2024-11-01',
          },
        ],
      },
      {
        codes: [CODE_A],
        actual: 'codeA actual text',
        notActual: 'codeA notActual text',
        datePairs: [CODE_A_DATE_PAIR],
      },
    ];

    const baseAanvragen = [baseAanvraag];

    it('should return undefined when no matching conditions', () => {
      const result = getHulpmiddelenDisclaimer(
        config,
        baseAanvraag,
        baseAanvragen
      );
      expect(result).toBeUndefined();
    });

    it('hasActueelMatch', () => {
      const aanvraag = {
        ...baseAanvraag,
        datumEindeGeldigheid: '2024-10-31',
        isActueel: false,
      };

      const aanvragen = [
        aanvraag,
        {
          ...baseAanvraag,
          datumIngangGeldigheid: '2024-11-01',
        },
      ];

      const result = getHulpmiddelenDisclaimer(config, aanvraag, aanvragen);
      expect(result).toBe('notActual generic text');
    });

    it('hasNietActueelMatch', () => {
      const aanvraag = {
        ...baseAanvraag,
        datumIngangGeldigheid: '2024-11-01',
        isActueel: true,
      };

      const aanvragen = [
        aanvraag,
        {
          ...baseAanvraag,
          datumEindeGeldigheid: '2024-10-31',
          isActueel: false,
        },
      ];

      const result = getHulpmiddelenDisclaimer(config, aanvraag, aanvragen);
      expect(result).toBe('actual generic text');
    });

    it('Uses generic config if no config is found', () => {
      const currentAanvraag = {
        ...baseAanvraag,
        productsoortCode: 'Unknown config code',
        datumIngangGeldigheid: '2024-11-01',
        isActueel: true,
      };

      const aanvragen = [
        currentAanvraag,
        {
          ...baseAanvraag,
          productsoortCode: 'Unknown config code',
          datumEindeGeldigheid: '2024-10-31',
          isActueel: false,
        },
      ];

      const result = getHulpmiddelenDisclaimer(
        config,
        currentAanvraag,
        aanvragen
      );
      expect(result).toBe('actual generic text');
    });

    it('does not match aanvragen with a different productsoortCode', () => {
      const currentAanvraag = {
        ...baseAanvraag,
        datumIngangGeldigheid: CODE_A_DATE_PAIR[1],
        isActueel: true,
        productsoortCode: CODE_A,
      };

      const aanvragen = [
        currentAanvraag,
        {
          ...baseAanvraag,
          datumEindeGeldigheid: CODE_A_DATE_PAIR[0],
          isActueel: false,
          productsoortCode: 'some other code',
        },
      ];

      const result = getHulpmiddelenDisclaimer(
        config,
        currentAanvraag,
        aanvragen
      );

      expect(result).toBeUndefined();
    });
  });

  describe('fetchWmoVoorzieningenCompact', () => {
    const mockBSN = '123456789';

    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should fetch, filter and transform voorzieningen', async () => {
      remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_AANVRAGEN_WMO);

      const result = await fetchWmoVoorzieningenCompact(mockBSN, {
        productGroup: ['WRA', 'hulpmiddelen'],
      });

      expect(
        result.content?.every((voorziening) => {
          return (
            voorziening.productGroup === 'WRA' ||
            voorziening.productGroup === 'hulpmiddelen'
          );
        })
      ).toBe(true);

      expect(result.content?.[0] && Object.keys(result.content[0])).toEqual([
        'productGroup',
        'titel',
        'id',
        'beschikkingNummer',
        'beschiktProductIdentificatie',
        'productIdentificatie',
        'datumBesluit',
        'datumBeginLevering',
        'datumEindeLevering',
        'datumOpdrachtLevering',
      ]);
    });

    it('should fetch and filter actuele WRA voorzieningen', async () => {
      remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_AANVRAGEN_WMO);

      const result = await fetchActueleWRAVoorzieningenCompact(mockBSN);

      expect(
        result.content?.every((voorziening) => {
          return voorziening.productGroup === 'WRA';
        })
      ).toBe(true);
    });
  });
});
