import merge from 'lodash.merge';
import Mockdate from 'mockdate';
import type { PartialDeep } from 'type-fest';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from 'vitest';

import { routes } from '../jzd-service-config.ts';
import type { HulpmiddelenDisclaimerConfig } from './status-line-items/wmo-hulpmiddelen.ts';
import { getHulpmiddelenDisclaimer } from './status-line-items/wmo-hulpmiddelen.ts';
import { fetchWmo, forTesting } from './wmo.ts';
import {
  getAuthProfileAndToken,
  remoteApi,
} from '../../../../testing/utils.ts';
import { jsonCopy } from '../../../../universal/helpers/utils.ts';
import type {
  ZorgnedAanvraagSource,
  ZorgnedAanvraagTransformed,
} from '../../zorgned/zorgned-types.ts';

vi.mock(
  '../../../../server/helpers/encrypt-decrypt',
  async (importOriginal) => ({
    ...((await importOriginal()) as object),
    encryptSessionIdWithRouteIdParam: vi
      .fn()
      .mockReturnValue('123-123-123-123'),
  })
);

const zorgnedApiResponse = (aanvragen: ZorgnedAanvraagSource[] = []) => ({
  _links: null,
  _embedded: {
    aanvraag: aanvragen,
  },
});

function getAanvraag(
  mergeProps: PartialDeep<
    ZorgnedAanvraagSource,
    { recurseIntoArrays: true }
  > = {}
): ZorgnedAanvraagSource {
  return merge(
    {
      identificatie: '2280949',
      procesIdentificatie: '2280949',
      casusIdentificatie: '1050320',
      datumAanvraag: '2022-07-09',
      beschikking: {
        beschikkingNummer: 357,
        datumAfgifte: '2022-08-01',
        beschikteProducten: [
          {
            identificatie: '883696',
            product: {
              identificatie: '740',
              productsoortCode: 'AOV',
              omschrijving: 'wmo product',
            },
            resultaat: 'toegewezen',
            toegewezenProduct: {
              datumIngangGeldigheid: '2022-08-01',
              datumEindeGeldigheid: '2022-10-18',
              actueel: false,
              leveringsvorm: 'zin',
              leverancier: {
                omschrijving: 'RMC Amsterdam',
              },
              toewijzingen: [],
              betrokkenen: [],
            },
          },
        ],
      },
      documenten: [
        {
          documentidentificatie: 'B2349053',
          procesIdentificatie: '2280949',
          casusIdentificatie: '1050320',
          omschrijving: 'Beschrijving van het besluit',
          omschrijvingclientportaal: 'Besluit: naam document',
          datumDefinitief: '2022-07-09T10:32:20.7',
          bestandsnaam: '034977CU.pdf',
        },
      ],
    },
    mergeProps
  ) as ZorgnedAanvraagSource;
}

function mockFetchWmoResponse(aanvragen: ZorgnedAanvraagSource[]) {
  remoteApi
    .post('/zorgned/aanvragen')
    .reply(200, zorgnedApiResponse(aanvragen));
}

async function fetchFirstWmoVoorziening(aanvraag: ZorgnedAanvraagSource) {
  mockFetchWmoResponse([aanvraag]);
  const response = await fetchWmo(getAuthProfileAndToken());
  return response.content![0];
}

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

  describe('fetchWmo', () => {
    test('fetchWmo returns transformed data', async () => {
      mockFetchWmoResponse([getAanvraag()]);
      expect(await fetchWmo(getAuthProfileAndToken())).toStrictEqual({
        content: [
          {
            dateDecision: '2022-07-09T10:32:20.7',
            dateDecisionFormatted: '09 juli 2022',
            decision: 'Toegewezen',
            displayStatus: 'Einde recht',
            documents: [
              {
                datePublished: '2022-07-09T10:32:20.7',
                download: '034977CU.pdf',
                filename: '034977CU.pdf',
                id: 'B2349053',
                title: 'Besluit: naam document',
                url: 'http://bff-api-host/api/v1/services/wmo/document?id=123-123-123-123',
              },
            ],
            id: '357-883696',
            isActual: false,
            itemTypeCode: 'AOV',
            link: {
              title: 'Meer informatie',
              to: '/zorg-en-ondersteuning/voorziening/wmo-product/357-883696',
            },
            statusDate: '2022-10-18',
            statusDateFormatted: '18 oktober 2022',
            steps: [
              {
                datePublished: '',
                description: '<p>Uw aanvraag is ontvangen.</p>',
                documents: [],
                id: 'status-step-0',
                isActive: false,
                isChecked: true,
                isVisible: true,
                status: 'Aanvraag ontvangen',
              },
              {
                datePublished: '2022-08-01',
                description: '<p>Uw aanvraag is in behandeling.</p>',
                documents: [],
                id: 'status-step-1',
                isActive: false,
                isChecked: true,
                isVisible: true,
                status: 'In behandeling',
              },
              {
                datePublished: '2022-07-09T10:32:20.7',
                description:
                  '<p>U krijgt wmo product per 01 augustus 2022.</p> <p>In de brief leest u meer over dit besluit. De brief staat bovenaan deze pagina.</p>',
                documents: [],
                id: 'status-step-3',
                isActive: false,
                isChecked: true,
                isVisible: true,
                status: 'Besluit genomen',
              },
              {
                datePublished: '2022-10-18',
                description:
                  '<p>Uw recht op wmo product is beëindigd per 18 oktober 2022.</p>',
                documents: [],
                id: 'status-step-4',
                isActive: true,
                isChecked: true,
                isVisible: true,
                status: 'Einde recht',
              },
            ],
            supplier: 'RMC Amsterdam',
            title: 'Wmo product',
          },
        ],
        status: 'OK',
      });
    });

    it('maps frontend fields and MA actions for eligible WRA/ZIN voorziening', async () => {
      const voorziening = await fetchFirstWmoVoorziening(
        getAanvraag({
          beschikking: {
            beschikteProducten: [
              {
                product: {
                  identificatie: '13W12',
                  productsoortCode: 'WRA',
                },
                toegewezenProduct: {
                  actueel: true,
                  leveringsvorm: 'zin',
                  datumEindeGeldigheid: null,
                  datumIngangGeldigheid: null,
                  toewijzingen: [
                    {
                      datumOpdracht: '2022-07-10',
                      toewijzingsDatumTijd: '2022-07-10',
                      leveringen: [
                        {
                          begindatum: '2022-07-10',
                        },
                      ],
                    },
                  ],
                },
              },
            ],
          },
        })
      );

      expect(voorziening).toMatchObject({
        id: '357-883696',
        title: 'Wmo product',
        supplier: 'RMC Amsterdam',
        link: { title: 'Meer informatie' },
        itemTypeCode: 'WRA',
      });
      expect(voorziening.maActies).toEqual(
        expect.arrayContaining(['reparatieverzoek', 'stopzetten'])
      );
      expect(voorziening.maActieUrls?.reparatieverzoek).toContain(
        'GUID=ID%3A357-883696'
      );
      expect(voorziening.documents[0]?.url).toContain('id=123-123-123-123');
    });

    it('does not assign reparatieverzoek when WRA/ZIN has no delivery date yet', async () => {
      const voorziening = await fetchFirstWmoVoorziening(
        getAanvraag({
          beschikking: {
            beschikteProducten: [
              {
                product: {
                  identificatie: '13W12',
                  productsoortCode: 'WRA',
                },
                toegewezenProduct: {
                  actueel: true,
                  leveringsvorm: 'zin',
                  datumEindeGeldigheid: null,
                  toewijzingen: [],
                },
              },
            ],
          },
        })
      );

      expect(voorziening.maActies).toEqual(
        expect.arrayContaining(['stopzetten'])
      );
      expect(voorziening.maActies).not.toContain('reparatieverzoek');
      expect(voorziening.maActieUrls).toBeUndefined();
    });

    it('assigns PGB-specific MA action for WRA/PGB voorziening', async () => {
      const voorziening = await fetchFirstWmoVoorziening(
        getAanvraag({
          beschikking: {
            beschikteProducten: [
              {
                product: {
                  identificatie: '13W12',
                  productsoortCode: 'WRA',
                },
                toegewezenProduct: {
                  actueel: true,
                  leveringsvorm: 'pgb',
                  datumEindeGeldigheid: null,
                },
              },
            ],
          },
        })
      );

      expect(voorziening.maActies).toEqual(
        expect.arrayContaining(['pgb-reparatieverzoek', 'stopzetten'])
      );
      expect(voorziening.maActies).not.toContain('reparatieverzoek');
      expect(voorziening.maActieUrls).toBeUndefined();
    });
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
      ).toStrictEqual([
        {
          datePublished: '2024-06-24',
          id: 'document-1',
          title: 'Document 1',
          url: 'http://bff-api-host/api/v1/services/wmo/document?id=123-123-123-123',
        },
      ]);
    });

    test('Assign documents before MINIMUM_REQUEST_DATE_FOR_DOCUMENTS', () => {
      expect(
        forTesting.getDocuments(
          'xxx-222',
          jsonCopy({ ...aanvraag, datumAanvraag: '2017-04-12' }),
          routes.protected.WMO_DOCUMENT_DOWNLOAD
        )
      ).toStrictEqual([]);
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
      ).toStrictEqual([
        {
          datePublished: '2024-06-24',
          id: 'document-1',
          title: 'Document 1',
          url: 'http://bff-api-host/api/v1/services/wmo/document?id=123-123-123-123',
        },
        {
          datePublished: '2024-06-24',
          id: 'document-1',
          title: 'Document 1',
          url: 'http://bff-api-host/api/v1/services/wmo/document?id=123-123-123-123',
        },
      ]);
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
      leveringsVorm: 'ZIN',
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
      procesIdentificatie: '',
      leverancierIdentificatie: '',
      procesMeldingIdentificatie: null,
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
        datumIngangGeldigheid: CODE_A_DATE_PAIR.datumIngangGeldigheid,
        isActueel: true,
        productsoortCode: CODE_A,
      };

      const aanvragen = [
        currentAanvraag,
        {
          ...baseAanvraag,
          datumEindeGeldigheid: CODE_A_DATE_PAIR.datumEindeGeldigheid,
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
});
