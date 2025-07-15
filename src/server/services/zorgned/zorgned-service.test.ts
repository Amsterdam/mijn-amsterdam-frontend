import Mockdate from 'mockdate';

import {
  fetchAanvragen,
  fetchAanvragenWithRelatedPersons,
  fetchDocument,
  fetchRelatedPersons,
  forTesting,
} from './zorgned-service';
import {
  ZORGNED_GEMEENTE_CODE,
  ZorgnedPerson,
  ZorgnedPersoonsgegevensNAWResponse,
  ZorgnedResponseDataSource,
} from './zorgned-types';
import ZORGNED_JZD_AANVRAGEN from '../../../../mocks/fixtures/zorgned-jzd-aanvragen.json';
import { remoteApiHost } from '../../../testing/setup';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import {
  apiErrorResult,
  ApiSuccessResponse,
} from '../../../universal/helpers/api';
import * as request from '../../helpers/source-api-request';

const mocks = vi.hoisted(() => {
  return {
    mockDocumentIdEncrypted: 'mock-encrypted-document-id',
    mockDocumentId: 'mock-document-id',
  };
});

vi.mock('../../../server/helpers/encrypt-decrypt', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  decrypt: vi.fn().mockReturnValue(`session-id:${mocks.mockDocumentId}`),
  encrypt: vi.fn().mockReturnValue([mocks.mockDocumentIdEncrypted, 'xx']),
}));

describe('zorgned-service', () => {
  const requestData = vi.spyOn(request, 'requestData');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    Mockdate.set('2023-11-23');
  });

  afterAll(() => {
    Mockdate.reset();
  });

  test('transformDocumenten', () => {
    expect(
      forTesting.transformDocumenten([
        {
          documentidentificatie: 'B73199',
          omschrijving: 'WRA beschikking Definitief',
          omschrijvingclientportaal: 'WRA beschikking Definitief',
          datumDefinitief: '2013-05-17T00:00:00',
          zaakidentificatie: null,
        },
      ])
    ).toStrictEqual([
      {
        datePublished: '2013-05-17T00:00:00',
        id: 'B73199',
        title: 'WRA beschikking Definitief',
        url: '',
      },
    ]);

    expect(
      forTesting.transformDocumenten([
        {
          documentidentificatie: 'B73199',
          omschrijving: 'WRA beschikking Definitief',
          omschrijvingclientportaal: 'WRA beschikking Definitief',
          datumDefinitief: null,
          zaakidentificatie: null,
        },
      ])
    ).toStrictEqual([]);
  });

  test('transformZorgnedAanvragen', () => {
    expect(
      forTesting.transformZorgnedAanvragen({
        _embedded: {
          aanvraag: [
            ...ZORGNED_JZD_AANVRAGEN._embedded.aanvraag.filter((aanvraag) =>
              ['2703104', '2696493', '2719515'].includes(aanvraag.identificatie)
            ),
          ],
        },
      } as ZorgnedResponseDataSource)
    ).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": [
            "123123123",
          ],
          "datumAanvraag": "2024-09-30",
          "datumBeginLevering": "2024-09-30",
          "datumBesluit": "2024-09-30",
          "datumEindeGeldigheid": "2024-10-01",
          "datumEindeLevering": "2024-10-01",
          "datumIngangGeldigheid": "2024-09-30",
          "datumOpdrachtLevering": "2024-09-30T18:58:05.6966667",
          "datumToewijzing": "2024-09-30T18:58:05.6966667",
          "documenten": [],
          "id": "2719515",
          "isActueel": false,
          "leverancier": "Otolift",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "13W15",
          "productsoortCode": "WRA1",
          "resultaat": "toegewezen",
          "titel": "reparatie-/verwijderopdracht   trapliften",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-04-18",
          "datumBeginLevering": null,
          "datumBesluit": "2024-04-18",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": "2024-07-09T16:44:10.89",
          "datumToewijzing": "2024-07-09T16:44:10.89",
          "documenten": [
            {
              "datePublished": "2024-08-20T16:02:09.277",
              "id": "B2813755",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
            {
              "datePublished": "2024-07-09T16:45:28.253",
              "id": "B2810215",
              "title": "Naam in Inkijk-API",
              "url": "",
            },
            {
              "datePublished": "2024-07-09T16:43:58.217",
              "id": "B2810214",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
          ],
          "id": "2703104",
          "isActueel": false,
          "leverancier": "Cordaan",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "01214",
          "productsoortCode": "WMH",
          "resultaat": "toegewezen",
          "titel": "hulp bij het huishouden bijzondere schoonmaak",
        },
        {
          "betrokkenen": [
            "123123123123",
          ],
          "datumAanvraag": "2024-01-25",
          "datumBeginLevering": "2024-03-14",
          "datumBesluit": "2024-01-25",
          "datumEindeGeldigheid": null,
          "datumEindeLevering": null,
          "datumIngangGeldigheid": "2024-01-01",
          "datumOpdrachtLevering": "2024-01-25T17:10:55.2733333",
          "datumToewijzing": "2024-01-25T17:10:55.2733333",
          "documenten": [
            {
              "datePublished": "2024-01-25T17:08:09.837",
              "id": "B2791921",
              "title": "Besluit: toekenning AIO/AO/Dagbest/Logeeropvang",
              "url": "",
            },
          ],
          "id": "2696493",
          "isActueel": true,
          "leverancier": "Amstelring",
          "leveringsVorm": "ZIN",
          "productIdentificatie": "07A08",
          "productsoortCode": "DBS",
          "resultaat": "toegewezen",
          "titel": "dagbesteding meedoen",
        },
      ]
    `);

    expect(
      forTesting.transformZorgnedAanvragen(
        null as unknown as ZorgnedResponseDataSource
      )
    ).toStrictEqual([]);
  });

  it('should fetch aanvragen', async () => {
    remoteApi.post('/zorgned/aanvragen').reply(200, []);

    const BSN = '123456789';
    const result = await fetchAanvragen(BSN, {
      zorgnedApiConfigKey: 'ZORGNED_JZD',
      requestBodyParams: {
        maxeinddatum: '2018-01-01',
        regeling: 'wmo',
      },
    });

    expect(requestData).toHaveBeenCalledWith({
      url: `${remoteApiHost}/zorgned/aanvragen`,
      data: {
        maxeinddatum: '2018-01-01',
        regeling: 'wmo',
        burgerservicenummer: BSN,
        gemeentecode: ZORGNED_GEMEENTE_CODE,
      },
      transformResponse: expect.any(Function),
      method: 'post',
      headers: {
        Token: process.env.BFF_ZORGNED_API_TOKEN,
        'Content-type': 'application/json; charset=utf-8',
        'x-cache-key-supplement': 'JZD',
      },
      httpsAgent: expect.any(Object),
    });

    expect(result).toStrictEqual({
      content: [],
      status: 'OK',
    });
  });

  it.each([
    null,
    {
      omschrijving: 'test',
      mimetype: 'application/pdf',
    },
    '"xxx"',
  ])('should return error for response %s', async (payload: any) => {
    remoteApi.post('/zorgned/document').reply(200, payload);

    const BSN = '567890';
    const result = await fetchDocument(
      BSN,
      'ZORGNED_JZD',
      mocks.mockDocumentId
    );

    expect(result).toStrictEqual({
      content: null,
      message: 'Zorgned document download - no valid response data provided',
      status: 'ERROR',
    });
  });

  it('should fetch document successfully', async () => {
    const filename = 'Naam documentje';
    const mimetype = 'foo/bar';
    const base64Data = 'Zm9vLWJhcg==';

    const BSN = '8906789';

    remoteApi.post('/zorgned/document').reply(200, {
      inhoud: base64Data,
      omschrijving: filename,
      mimetype,
    });

    const result = await fetchDocument(
      BSN,
      'ZORGNED_JZD',
      mocks.mockDocumentId
    );

    expect(requestData).toHaveBeenCalledWith({
      httpsAgent: expect.any(Object),
      url: `${remoteApiHost}/zorgned/document`,
      data: {
        burgerservicenummer: BSN,
        gemeentecode: ZORGNED_GEMEENTE_CODE,
        documentidentificatie: mocks.mockDocumentId,
      },
      transformResponse: expect.any(Function),
      method: 'post',
      headers: {
        Token: process.env.BFF_ZORGNED_API_TOKEN,
        'Content-type': 'application/json; charset=utf-8',
        'x-cache-key-supplement': 'JZD',
      },
    });

    expect(result).toEqual({
      status: 'OK',
      content: {
        filename,
        mimetype,
        data: Buffer.from(base64Data, 'base64'),
      },
    });
  });

  test('transformZorgnedPersonResponse', () => {
    const naam = forTesting.transformZorgnedPersonResponse({
      persoon: {
        voorvoegsel: null,
        geboortenaam: 'Alex',
        voornamen: 'Flex',
        geboortedatum: '2016-07-09',
        bsn: 'x123z',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam).toStrictEqual({
      bsn: 'x123z',
      dateOfBirth: '2016-07-09',
      dateOfBirthFormatted: '09 juli 2016',
      name: 'Flex',
      partnernaam: null,
      partnervoorvoegsel: null,
    });

    const naam2 = forTesting.transformZorgnedPersonResponse({
      persoon: {
        voorvoegsel: 'de',
        geboortenaam: 'Jarvis',
        voornamen: 'Baron',
        geboortedatum: '2016-07-09',
        bsn: 'x123z',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam2).toStrictEqual({
      bsn: 'x123z',
      dateOfBirth: '2016-07-09',
      dateOfBirthFormatted: '09 juli 2016',
      name: 'Baron',
      partnernaam: null,
      partnervoorvoegsel: null,
    });

    const naam3 = forTesting.transformZorgnedPersonResponse({
      persoon: null,
    } as unknown as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam3).toBe(null);
  });

  describe('fetchAndMergeRelatedPersons', () => {
    const ZORGNED_RESPONSE_CONTENT = {
      _links: null,
      _embedded: {
        aanvraag: [
          {
            identificatie: '1126685618',
            datumAanvraag: '2023-04-25',
            beschikking: {
              datumAfgifte: '2023-05-17',
              beschikteProducten: [
                {
                  product: {
                    identificatie: 'WRA',
                    productCode: null,
                    productsoortCode: 'WRA',
                    omschrijving: 'woonruimteaanpassing (in behandeling)',
                  },
                  resultaat: 'toegewezen',
                  toegewezenProduct: {
                    datumIngangGeldigheid: '2023-05-06',
                    datumEindeGeldigheid: null,
                    actueel: true,
                    leveringsvorm: 'zin',
                    leverancier: {
                      omschrijving: 'Gebr Koenen B.V.',
                    },
                    toewijzingen: [
                      {
                        toewijzingsDatumTijd: '2024-01-25T17:10:55.2733333',
                        ingangsdatum: '2024-01-01',
                        datumOpdracht: '2024-01-25T17:10:55.2733333',
                        leveringen: [
                          {
                            begindatum: '2024-03-14',
                          },
                        ],
                      },
                    ],
                    betrokkenen: ['9999999999'],
                  },
                },
              ],
            },
            documenten: [],
          },
        ],
      },
    };

    test('happy', async () => {
      remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_RESPONSE_CONTENT);

      remoteApi
        .post('/zorgned/persoonsgegevensNAW')
        .times(2) // Request caching is not enabled in test mode.
        .reply(200, {
          persoon: {
            bsn: '9999999999',
            voorletters: 'E',
            voorvoegsel: null,
            geboortenaam: 'Alex',
            voornamen: 'Flex',
            geboortedatum: '2010-06-12',
          },
        } as ZorgnedPersoonsgegevensNAWResponse);

      const result = await fetchAanvragenWithRelatedPersons('9999999999', {
        zorgnedApiConfigKey: 'ZORGNED_AV',
      });

      expect(result).toStrictEqual({
        content: [
          {
            betrokkenPersonen: [
              {
                bsn: '9999999999',
                dateOfBirth: '2010-06-12',
                dateOfBirthFormatted: '12 juni 2010',
                isAanvrager: true,
                name: 'Flex',
                partnernaam: null,
                partnervoorvoegsel: null,
              },
            ],
            betrokkenen: ['9999999999'],
            bsnAanvrager: '9999999999',
            datumAanvraag: '2023-04-25',
            datumBeginLevering: '2024-03-14',
            datumBesluit: '2023-05-17',
            datumEindeGeldigheid: null,
            datumEindeLevering: null,
            datumIngangGeldigheid: '2023-05-06',
            datumOpdrachtLevering: '2024-01-25T17:10:55.2733333',
            datumToewijzing: '2024-01-25T17:10:55.2733333',
            documenten: [],
            id: '1126685618',
            isActueel: true,
            leverancier: 'Gebr Koenen B.V.',
            leveringsVorm: 'ZIN',
            productIdentificatie: 'WRA',
            productsoortCode: 'WRA',
            resultaat: 'toegewezen',
            titel: 'woonruimteaanpassing (in behandeling)',
          },
        ],
        status: 'OK',
      });
    });

    test('NAW request error', async () => {
      remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_RESPONSE_CONTENT);

      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

      const result = await fetchAanvragenWithRelatedPersons(
        getAuthProfileAndToken().profile.id,
        {
          zorgnedApiConfigKey: 'ZORGNED_AV',
        }
      );

      expect(result.content?.[0]?.betrokkenPersonen).toStrictEqual([]);
      expect('failedDependencies' in result).toBe(true);
      expect(
        'failedDependencies' in result &&
          'relatedPersons' in result.failedDependencies!
      ).toBe(true);
    });

    test('NAW relation not found', async () => {
      remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_RESPONSE_CONTENT);

      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, null!);

      const result = await fetchAanvragenWithRelatedPersons(
        getAuthProfileAndToken().profile.id,
        {
          zorgnedApiConfigKey: 'ZORGNED_AV',
        }
      );

      expect(result.content?.[0]?.betrokkenPersonen).toStrictEqual([]);
      expect('failedDependencies' in result).toBe(true);
      expect(
        'failedDependencies' in result &&
          'relatedPersons' in result.failedDependencies!
      ).toBe(true);
    });
  });
});

describe('fetchRelatedPersons', async () => {
  type Person = ZorgnedPersoonsgegevensNAWResponse['persoon'];

  function createPerson(person: Partial<Person>): Person {
    if (person.voornamen) {
      person.roepnaam = person.voornamen;
      person.voorletters = person.voornamen[0];
    }

    return {
      voornamen: 'Jay',
      roepnaam: 'Jay',
      voorletters: 'J',
      voorvoegsel: 'De',
      geboortenaam: 'Jay',
      geboortedatum: '20-20-2020',
      bsn: `bsn-${person.voornamen}`,
      clientidentificatie: null,
      ...person,
    };
  }

  function setupEndpointForFetchRelatedPersons({
    statusCode,
    persoongegevensNAWResponse,
  }: {
    statusCode: number;
    persoongegevensNAWResponse?: ZorgnedPersoonsgegevensNAWResponse | null;
  }): void {
    remoteApi
      .post('/zorgned/persoonsgegevensNAW')
      .reply(statusCode || 200, persoongegevensNAWResponse || {});
  }

  test('Did not return a person', async () => {
    setupEndpointForFetchRelatedPersons({
      statusCode: 200,
      persoongegevensNAWResponse: null,
    });
    setupEndpointForFetchRelatedPersons({
      statusCode: 404,
      persoongegevensNAWResponse: null,
    });

    const userIDs = ['1', '2'];

    const response = await fetchRelatedPersons(userIDs, 'ZORGNED_AV');
    expect(response).toStrictEqual(
      apiErrorResult(
        'Something went wrong when retrieving related persons.',
        null
      )
    );
  });

  test('Returns a person', async () => {
    setupEndpointForFetchRelatedPersons({
      statusCode: 200,
      persoongegevensNAWResponse: {
        persoon: createPerson({
          voorvoegsel: 'de',
          geboortenaam: 'Jarvis',
          voornamen: 'Baron',
          geboortedatum: '2016-07-09',
          bsn: 'x123z',
          partnernaam: null,
          partnervoorvoegsel: null,
        }),
      },
    });
    setupEndpointForFetchRelatedPersons({
      statusCode: 200,
      persoongegevensNAWResponse: {
        persoon: createPerson({
          voorvoegsel: null,
          geboortenaam: 'Alex',
          voornamen: 'Flex',
          geboortedatum: '2016-07-09',
          bsn: 'x123z',
          clientidentificatie: null,
          roepnaam: 'Alex',
          voorletters: 'A',
          partnernaam: 'hey ho',
          partnervoorvoegsel: null,
        }),
      },
    });

    const userIDs = ['1', '2'];

    const response = await fetchRelatedPersons(userIDs, 'ZORGNED_AV');
    const expected: ApiSuccessResponse<ZorgnedPerson[]> = {
      content: [
        {
          bsn: 'x123z',
          dateOfBirth: '2016-07-09',
          dateOfBirthFormatted: '09 juli 2016',
          name: 'Baron',
          partnernaam: null,
          partnervoorvoegsel: null,
        },
        {
          bsn: 'x123z',
          dateOfBirth: '2016-07-09',
          dateOfBirthFormatted: '09 juli 2016',
          name: 'Flex',
          partnernaam: 'hey ho',
          partnervoorvoegsel: null,
        },
      ],
      status: 'OK',
    };

    expect(response).toStrictEqual(expected);
  });
});
