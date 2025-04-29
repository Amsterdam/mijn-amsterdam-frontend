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
import { AuthProfileAndToken } from '../../auth/auth-types';
import * as request from '../../helpers/source-api-request';

const mocks = vi.hoisted(() => {
  return {
    mockAuthProfileAndToken: {
      profile: {
        id: 'mock-burgerservicenummer',
        profileType: 'private',
        authMethod: 'digid',
        sid: 'session-id',
      },
      token: 'mock-auth-token',
    },
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
    ).toMatchInlineSnapshot(`
      [
        {
          "datePublished": "2013-05-17T00:00:00",
          "id": "B73199",
          "title": "WRA beschikking Definitief",
          "url": "",
        },
      ]
    `);
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
      forTesting.transformZorgnedAanvragen(
        ZORGNED_JZD_AANVRAGEN as ZorgnedResponseDataSource
      )
    ).toMatchSnapshot();

    expect(
      forTesting.transformZorgnedAanvragen(
        null as unknown as ZorgnedResponseDataSource
      )
    ).toStrictEqual([]);
  });

  it('should fetch aanvragen', async () => {
    remoteApi.post('/zorgned/aanvragen').reply(200, []);

    const result = await fetchAanvragen(
      mocks.mockAuthProfileAndToken as AuthProfileAndToken,
      {
        zorgnedApiConfigKey: 'ZORGNED_JZD',
        requestBodyParams: {
          maxeinddatum: '2018-01-01',
          regeling: 'wmo',
        },
      }
    );

    expect(requestData).toHaveBeenCalledWith(
      {
        url: `${remoteApiHost}/zorgned/aanvragen`,
        data: {
          maxeinddatum: '2018-01-01',
          regeling: 'wmo',
          burgerservicenummer: mocks.mockAuthProfileAndToken.profile.id,
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
      },
      mocks.mockAuthProfileAndToken as AuthProfileAndToken
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "content": [],
        "status": "OK",
      }
    `);
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

    const result = await fetchDocument(
      mocks.mockAuthProfileAndToken as AuthProfileAndToken,
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

    remoteApi.post('/zorgned/document').reply(200, {
      inhoud: base64Data,
      omschrijving: filename,
      mimetype,
    });

    const result = await fetchDocument(
      mocks.mockAuthProfileAndToken as AuthProfileAndToken,
      'ZORGNED_JZD',
      mocks.mockDocumentId
    );

    expect(requestData).toHaveBeenCalledWith({
      httpsAgent: expect.any(Object),
      url: `${remoteApiHost}/zorgned/document`,
      data: {
        burgerservicenummer: mocks.mockAuthProfileAndToken.profile.id,
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

    expect(naam).toMatchInlineSnapshot(`
      {
        "bsn": "x123z",
        "dateOfBirth": "2016-07-09",
        "dateOfBirthFormatted": "09 juli 2016",
        "name": "Flex",
      }
    `);

    const naam2 = forTesting.transformZorgnedPersonResponse({
      persoon: {
        voorvoegsel: 'de',
        geboortenaam: 'Jarvis',
        voornamen: 'Baron',
        geboortedatum: '2016-07-09',
        bsn: 'x123z',
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(naam2).toMatchInlineSnapshot(`
      {
        "bsn": "x123z",
        "dateOfBirth": "2016-07-09",
        "dateOfBirthFormatted": "09 juli 2016",
        "name": "Baron",
      }
    `);

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

      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(200, {
        persoon: {
          bsn: '9999999999',
          voorletters: 'E',
          voorvoegsel: null,
          geboortenaam: 'Alex',
          voornamen: 'Flex',
          geboortedatum: '2010-06-12',
        },
      } as ZorgnedPersoonsgegevensNAWResponse);

      const result = await fetchAanvragenWithRelatedPersons(
        getAuthProfileAndToken(),
        {
          zorgnedApiConfigKey: 'ZORGNED_AV',
        }
      );

      expect(result).toMatchInlineSnapshot(`
        {
          "content": [
            {
              "betrokkenPersonen": [
                {
                  "bsn": "9999999999",
                  "dateOfBirth": "2010-06-12",
                  "dateOfBirthFormatted": "12 juni 2010",
                  "name": "Flex",
                },
              ],
              "betrokkenen": [
                "9999999999",
              ],
              "datumAanvraag": "2023-04-25",
              "datumBeginLevering": "2024-03-14",
              "datumBesluit": "2023-05-17",
              "datumEindeGeldigheid": null,
              "datumEindeLevering": null,
              "datumIngangGeldigheid": "2023-05-06",
              "datumOpdrachtLevering": "2024-01-25T17:10:55.2733333",
              "datumToewijzing": "2024-01-25T17:10:55.2733333",
              "documenten": [],
              "id": "4075803736",
              "isActueel": true,
              "leverancier": "Gebr Koenen B.V.",
              "leveringsVorm": "ZIN",
              "productIdentificatie": "WRA",
              "productsoortCode": "WRA",
              "resultaat": "toegewezen",
              "titel": "woonruimteaanpassing (in behandeling)",
            },
          ],
          "status": "OK",
        }
      `);
    });

    test('NAW request error', async () => {
      remoteApi.post('/zorgned/aanvragen').reply(200, ZORGNED_RESPONSE_CONTENT);

      remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500);

      const result = await fetchAanvragenWithRelatedPersons(
        getAuthProfileAndToken(),
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
        getAuthProfileAndToken(),
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

    const response = await fetchRelatedPersons(userIDs);
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
        }),
      },
    });

    const userIDs = ['1', '2'];

    const response = await fetchRelatedPersons(userIDs);
    const expected: ApiSuccessResponse<ZorgnedPerson[]> = {
      content: [
        {
          bsn: 'x123z',
          dateOfBirth: '2016-07-09',
          dateOfBirthFormatted: '09 juli 2016',
          name: 'Baron',
        },
        {
          bsn: 'x123z',
          dateOfBirth: '2016-07-09',
          dateOfBirthFormatted: '09 juli 2016',
          name: 'Flex',
        },
      ],
      status: 'OK',
    };

    expect(response).toStrictEqual(expected);
  });
});
