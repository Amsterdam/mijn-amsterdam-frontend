import Mockdate from 'mockdate';

import { fetchWmo, forTesting } from './wmo';
import ZORGNED_AANVRAGEN_WMO from '../../../../mocks/fixtures/zorgned-jzd-aanvragen.json';
import { remoteApi } from '../../../testing/utils';
import { jsonCopy } from '../../../universal/helpers/utils';
import { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types';
import { getHulpmiddelenDisclaimer } from './status-line-items/wmo-hulpmiddelen';
import { BffEndpoints } from '../../routing/bff-routes';

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

    expect(
      await fetchWmo('xxxx', {
        profile: {
          id: '123123',
          authMethod: 'digid',
          profileType: 'private',
          sid: '',
        },
        token: '',
      })
    ).toMatchSnapshot();
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
          BffEndpoints.WMO_DOCUMENT_DOWNLOAD
        )
      ).toMatchInlineSnapshot(`
          [
            {
              "datePublished": "2024-06-24",
              "id": "document-1",
              "title": "Document 1",
              "url": "http://bff-api-host/api/v1/services/wmo/document/123-123-123-123",
            },
          ]
        `);
    });

    test('Assign documents before MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(
        forTesting.getDocuments(
          'xxx-222',
          jsonCopy({ ...aanvraag, datumAanvraag: '2017-04-12' }),
          BffEndpoints.WMO_DOCUMENT_DOWNLOAD
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
          BffEndpoints.WMO_DOCUMENT_DOWNLOAD
        )
      ).toMatchInlineSnapshot(`
        [
          {
            "datePublished": "2024-06-24",
            "id": "document-1",
            "title": "Document 1",
            "url": "http://bff-api-host/api/v1/services/wmo/document/123-123-123-123",
          },
          {
            "datePublished": "2024-06-24",
            "id": "document-1",
            "title": "Document 1",
            "url": "http://bff-api-host/api/v1/services/wmo/document/123-123-123-123",
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
    };

    const baseAanvragen = [baseAanvraag];

    it('should return undefined when no matching conditions', () => {
      const result = getHulpmiddelenDisclaimer(baseAanvraag, baseAanvragen);
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

      const result = getHulpmiddelenDisclaimer(aanvraag, aanvragen);
      expect(result).toBe(
        'Door een fout kan het zijn dat dit hulpmiddel ten onrechte bij "Eerdere en afgewezen voorzieningen" staat.'
      );
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

      const result = getHulpmiddelenDisclaimer(aanvraag, aanvragen);
      expect(result).toBe(
        'Door een fout kan het zijn dat dit hulpmiddel ook bij "Eerdere en afgewezen voorzieningen" staat. Daar vindt u dan het originele besluit met de juiste datums.'
      );
    });
  });
});
