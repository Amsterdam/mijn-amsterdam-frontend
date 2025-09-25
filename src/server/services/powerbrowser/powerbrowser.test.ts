import stream from 'node:stream';

import Mockdate from 'mockdate';
import { describe, expect } from 'vitest';

import { fetchZaken, fetchDocument, forTesting } from './powerbrowser-service';
import type {
  PBDocumentFields,
  PBZaakFields,
  PBZaakRecord,
  SearchRequestResponse,
} from './powerbrowser-types';
import { remoteApi } from '../../../testing/utils';
import { StatusLineItem } from '../../../universal/types/App.types';
import type { AuthProfile, AuthProfileAndToken } from '../../auth/auth-types';
import * as encryptDecrypt from '../../helpers/encrypt-decrypt';
import { powerBrowserZaakTransformers } from '../toeristische-verhuur/bed-and-breakfast/bed-and-breakfast-pb-zaken';
import { BBVergunningFrontend } from '../toeristische-verhuur/bed-and-breakfast/bed-and-breakfast-types';

describe('Powerbrowser service', () => {
  const authProfile: AuthProfile = {
    id: 'test-id',
    profileType: 'private',
    sid: 'test-sid',
    authMethod: 'digid',
  };
  const zaakId = 'test-zaak-id';
  const authProfileAndToken: AuthProfileAndToken = {
    profile: authProfile,
    token: 'test-tma-token',
    expiresAtMilliseconds: 0,
  };

  const documentNamesMA_PB = {
    ['DocumentnaamMA']: ['DocumentnaamPB', 'AndersInPBMaarZelfdeInMA'],
    ['NietDocumentnaamMA']: ['NietDocumentnaamPB'],
  };

  beforeEach(() => {
    remoteApi.post('/powerbrowser/Token').reply(200, 'test-token');
  });

  describe('fetchZaken', () => {
    test('should filter only bed and breakfast zaken', async () => {
      remoteApi
        .post(/\/powerbrowser/)
        .times(3)
        .reply((uri) => {
          if (uri.includes('SearchRequest')) {
            return [200, { records: [{ id: 'test-person-id' }] }];
          }

          if (uri.includes('Link/PERSONEN/GFO_ZAKEN/Table')) {
            return [
              200,
              {
                records: [
                  {
                    id: 'test-zaak-id',
                    fields: [
                      {
                        fieldName: 'FMT_CAPTION',
                        text: 'Een ander type zaak',
                      },
                    ],
                  },
                ],
              },
            ];
          }

          return [200, null];
        });

      const result = await fetchZaken(
        authProfile,
        powerBrowserZaakTransformers
      );
      expect(result.status).toBe('OK');
      expect(result.content).toHaveLength(0);
    });

    test('should return zaken if all fetches are successful', async () => {
      remoteApi
        .post(/\/powerbrowser/)
        .times(3)
        .reply((uri) => {
          if (uri.includes('SearchRequest')) {
            return [200, { records: [{ id: 'test-person-id' }] }];
          }

          if (uri.includes('Link/PERSONEN/GFO_ZAKEN/Table')) {
            return [
              200,
              {
                records: [
                  {
                    id: 'test-zaak-id',
                    fields: [
                      {
                        fieldName: 'FMT_CAPTION',
                        text: 'Z/123/123 aanvraag Bed en breakfast behandelen',
                      },
                    ],
                  },
                ],
              },
            ];
          }

          return [200, null];
        });

      remoteApi.get(/\/powerbrowser/).reply((uri) => {
        if (uri.includes('record/GFO_ZAKEN')) {
          return [200, [{ id: 'test-zaak-id', fields: [] }]];
        }
        return [200, null];
      });

      const result = await fetchZaken(
        authProfile,
        powerBrowserZaakTransformers
      );
      expect(result.status).toBe('OK');
      expect(result.content).toHaveLength(1);
    });

    test('should return an error if fetching person or maatschap ID fails', async () => {
      remoteApi.post(/\/powerbrowser/).reply((uri) => {
        if (uri.includes('SearchRequest')) {
          return [500, 'some-error'];
        }
      });

      const result = await fetchZaken(
        authProfile,
        powerBrowserZaakTransformers
      );
      expect(result.status).toBe('ERROR');
    });

    test('should return an error if fetching zaak IDs fails', async () => {
      remoteApi
        .post(/\/powerbrowser/)
        .times(2)
        .reply((uri) => {
          if (uri.includes('SearchRequest')) {
            return [200, { records: [{ id: 'test-person-id' }] }];
          }

          if (uri.includes('Link/PERSONEN/GFO_ZAKEN/Table')) {
            return [500, 'some-error'];
          }
        });

      const result = await fetchZaken(
        authProfile,
        powerBrowserZaakTransformers
      );
      expect(result.status).toBe('ERROR');
    });

    test('should return an error if fetching zaken by IDs fails', async () => {
      remoteApi
        .post(/\/powerbrowser/)
        .times(2)
        .reply((uri) => {
          if (uri.includes('SearchRequest')) {
            return [200, { records: [{ id: 'test-person-id' }] }];
          }

          if (uri.includes('Link/PERSONEN/GFO_ZAKEN/Table')) {
            return [200, { records: [{ id: 'test-zaak-id' }] }];
          }
        });
      remoteApi.get(/\/powerbrowser/).reply((uri) => {
        if (uri.includes('record/GFO_ZAKEN')) {
          return [500, 'some-error'];
        }

        return [200, null];
      });

      const result = await fetchZaken(
        authProfile,
        powerBrowserZaakTransformers
      );
      expect(result.status).toBe('ERROR');
    });
  });

  describe('fetchDocumentsList', () => {
    test('should return document list if fetch is successful', async () => {
      remoteApi.post(/\/powerbrowser/).reply((uri) => {
        if (uri.includes('SearchRequest')) {
          return [
            200,
            {
              records: [
                {
                  id: 'test-document-id',
                  fields: [
                    {
                      fieldName: 'OMSCHRIJVING',
                      fieldValue: 'DocumentnaamPB',
                    },
                  ],
                },
              ],
            },
          ];
        }

        return [200, null];
      });

      const result = await forTesting.fetchDocumentsList(
        authProfileAndToken.profile,
        documentNamesMA_PB,
        zaakId
      );
      expect(result.status).toBe('OK');
      expect(result.content).toHaveLength(1);
      expect(result.content?.[0]?.download).toBe('DocumentnaamMA');
    });

    test('should return an error if fetch fails', async () => {
      remoteApi.post(/\/powerbrowser/).reply((uri) => {
        if (uri.includes('SearchRequest')) {
          return [500, 'some-error'];
        }

        return [500, null];
      });

      const result = await forTesting.fetchDocumentsList(
        authProfileAndToken.profile,
        documentNamesMA_PB,
        zaakId
      );
      expect(result.status).toBe('ERROR');
    });
  });

  describe('fetchDocument', () => {
    const documentId = 'test-doc-id';

    test('should return document if fetch is successful', async () => {
      remoteApi.get(/\/powerbrowser/).reply((uri) => {
        if (uri.includes('/Pdf')) {
          return [200, 'Zm9vLWJhcg=='];
        }

        return [200, null];
      });

      const result = await fetchDocument(authProfileAndToken, documentId);
      expect(result.status).toBe('OK');
      expect(result.content).toEqual({
        data: expect.any(stream),
        mimetype: 'application/pdf',
      });
      result.content?.data.on('data', (chunk: Buffer) => {
        expect(Buffer.from(chunk.toString(), 'base64').toString('utf-8')).toBe(
          'foo-bar'
        );
      });
    });

    test('should return an error if fetch fails', async () => {
      remoteApi.get(/\/powerbrowser/).reply((uri) => {
        if (uri.includes('/Pdf')) {
          return [500, 'some-error'];
        }
        return [500, null];
      });

      const result = await fetchDocument(authProfileAndToken, documentId);
      expect(result.status).toBe('ERROR');
    });
  });
  describe('fetchPowerBrowserToken_', () => {
    test('should fetch token successfully', async () => {
      const result = await forTesting.fetchPowerBrowserToken_();
      expect(result.status).toBe('OK');
      expect(result.content).toBe('test-token');
    });

    test('should return an error if token fetch fails', async () => {
      const resultSuccess = await forTesting.fetchPowerBrowserToken_();
      expect(resultSuccess.status).toBe('OK');

      remoteApi.post('/powerbrowser/Token').reply(500, 'some-error');
      const result = await forTesting.fetchPowerBrowserToken_();
      expect(result.status).toBe('ERROR');
    });
  });

  describe('fetchPowerBrowserData', () => {
    test('should fetch data successfully', async () => {
      remoteApi.post('/powerbrowser/data').reply(200, { data: 'test-data' });

      const result = await forTesting.fetchPowerBrowserData({
        formatUrl: ({ url }) => {
          return `${url}/data`;
        },
      });
      expect(result.status).toBe('OK');
      expect(result.content).toEqual({ data: 'test-data' });
    });

    test('should return an error if data fetch fails', async () => {
      remoteApi.post('/powerbrowser/Token').reply(200, 'test-token');
      remoteApi.get('/powerbrowser/data').reply(500, 'some-error');

      const result = await forTesting.fetchPowerBrowserData({
        formatUrl: ({ url }) => `${url}/data`,
      });
      expect(result.status).toBe('ERROR');
    });
  });

  describe('fetchPersoonOrMaatschapIdByUid', () => {
    test('should fetch person ID successfully', async () => {
      remoteApi.post('/powerbrowser/SearchRequest').reply(200, {
        records: [
          { id: 'test-person-id' },
          { id: 'test-person-id2' },
          { id: 'test-person-id3' },
        ],
      });

      const result = await forTesting.fetchPersonenOrMaatschappenIdsByProfileID(
        {
          tableName: 'PERSONEN',
          fieldName: 'BURGERSERVICENUMMER',
          profileID: 'test-id',
        }
      );
      expect(result.status).toBe('OK');
      expect(result.content).toEqual([
        'test-person-id',
        'test-person-id2',
        'test-person-id3',
      ]);
    });

    test('should return null if no person ID found', async () => {
      remoteApi.post('/powerbrowser/SearchRequest').reply(200, { records: [] });

      const result = await forTesting.fetchPersonenOrMaatschappenIdsByProfileID(
        {
          tableName: 'PERSONEN',
          fieldName: 'BURGERSERVICENUMMER',
          profileID: 'test-id',
        }
      );
      expect(result.status).toBe('OK');
      expect(result.content).toEqual([]);
    });

    test('should return an error if fetch fails', async () => {
      remoteApi.post('/powerbrowser/SearchRequest').reply(500, 'some-error');

      const result = await forTesting.fetchPersonenOrMaatschappenIdsByProfileID(
        {
          tableName: 'PERSONEN',
          fieldName: 'BURGERSERVICENUMMER',
          profileID: 'test-id',
        }
      );
      expect(result.status).toBe('ERROR');
    });
  });

  describe('fetchPBZaken', () => {
    test('should return an error if fetch fails', async () => {
      remoteApi
        .post('/powerbrowser/Link/PERSONEN/GFO_ZAKEN/Table')
        .reply(500, 'some-error');

      const result = await forTesting.fetchZakenRecords(
        authProfile,
        powerBrowserZaakTransformers
      );
      expect(result.status).toBe('ERROR');
    });
  });

  describe('getFieldValue', () => {
    test('should return text for Resultaat_id', () => {
      const fields: PBZaakFields[] = [
        {
          fieldName: 'RESULTAAT_ID',
          fieldValue: 'test-value',
          text: 'some-text-value',
        },
      ];
      const result = forTesting.getFieldValue('RESULTAAT_ID', fields);
      expect(result).toBe('some-text-value');
    });

    test('should return fieldValue for others', () => {
      const fields: PBZaakFields[] = [
        { fieldName: 'ZAAK_IDENTIFICATIE', fieldValue: 'Z/123/123' },
      ];
      const result = forTesting.getFieldValue('ZAAK_IDENTIFICATIE', fields);
      expect(result).toBe('Z/123/123');
    });

    test('should return null if field not found', () => {
      const fields = [
        { fieldName: 'OTHER_FIELD', fieldValue: 'test-value' },
      ] as unknown as PBZaakFields[];

      const result = forTesting.getFieldValue('RESULTAAT_ID', fields);
      expect(result).toBeNull();
    });
  });

  describe('getZaakResultaat', () => {
    test('should return transformed result', () => {
      const result = forTesting.getZaakResultaat('Verleend');
      expect(result).toBe('Verleend');
    });

    test('should return null if result is null', () => {
      const result = forTesting.getZaakResultaat(null);
      expect(result).toBeNull();
    });
  });

  describe('fetchZaakAdres', () => {
    test('should fetch zaak address successfully', async () => {
      remoteApi.post('/powerbrowser/Link/GFO_ZAKEN/ADRESSEN/Table').reply(200, {
        records: [
          {
            fields: [{ fieldName: 'FMT_CAPTION', fieldValue: 'Test Address' }],
          },
        ],
      });

      const result = await forTesting.fetchZaakAdres('test-zaak-id');
      expect(result.status).toBe('OK');
      expect(result.content).toBe('Test Address');
    });

    test('should return null if no address found', async () => {
      remoteApi
        .post('/powerbrowser/Link/GFO_ZAKEN/ADRESSEN/Table')
        .reply(200, { records: [] });

      const result = await forTesting.fetchZaakAdres('test-zaak-id');
      expect(result.status).toBe('OK');
      expect(result.content).toBeNull();
    });

    test('should return an error if fetch fails', async () => {
      remoteApi
        .post('/powerbrowser/Link/GFO_ZAKEN/ADRESSEN/Table')
        .reply(500, 'some-error');

      const result = await forTesting.fetchZaakAdres('test-zaak-id');
      expect(result.status).toBe('ERROR');
    });
  });

  describe('fetchZaakStatussen', () => {
    test('should fetch zaak statuses successfully', async () => {
      remoteApi
        .post('/powerbrowser/Report/RunSavedReport')
        .reply(200, [{ omschrijving: 'In behandeling', datum: '2023-02-01' }]);

      const zaak = {
        id: 'test-zaak-id',
        dateRequest: '2023-01-01',
        dateEnd: null,
        documents: [],
      } as unknown as BBVergunningFrontend;

      const result = await forTesting.fetchZaakStatusDates(zaak);
      expect(result.status).toBe('OK');
      expect(result.content).toHaveLength(1);
      expect(result.content![0].status).toBe('In behandeling');
      expect(result.content![0].datePublished).toBe('2023-02-01');
    });

    test('should return an error if fetch fails', async () => {
      remoteApi
        .post('/powerbrowser/Report/RunSavedReport')
        .reply(500, 'some-error');

      const zaak = {
        id: 'test-zaak-id',
        dateRequest: '2023-01-01',
        dateEnd: null,
      } as unknown as BBVergunningFrontend;

      const result = await forTesting.fetchZaakStatusDates(zaak);
      expect(result.status).toBe('ERROR');
    });
  });

  describe('fetchZakenStatusDates', () => {
    test('should fetch statusDates successfully', async () => {
      remoteApi
        .post('/powerbrowser/Report/RunSavedReport')
        .reply(200, [{ omschrijving: 'In behandeling', datum: '2023-02-01' }]);

      const zaak = {
        id: 'test-zaak-id',
        dateRequest: '2023-01-01',
        dateEnd: null,
        documents: [],
      } as unknown as BBVergunningFrontend;

      const result = await forTesting.fetchSettledZaakStatusDates(zaak);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('In behandeling');
      expect(result[0].datePublished).toBe('2023-02-01');
    });
  });

  describe('fetchZakenDocuments', () => {
    test('should fetch documents successfully', async () => {
      const docNameMA = 'docNaamMA';
      const docNamePB = 'docNaamPB';
      const docNameMA_PB = { [docNameMA]: [docNamePB] };
      remoteApi.post('/powerbrowser/SearchRequest').reply(200, {
        records: [
          {
            id: 'test-document-id',
            fields: [
              {
                fieldName: 'OMSCHRIJVING',
                fieldValue: docNamePB,
              },
            ],
          },
        ],
      });

      const zaak = {
        id: 'test-zaak-id',
        dateRequest: '2023-01-01',
        dateEnd: null,
      } as unknown as BBVergunningFrontend;

      const result = await forTesting.fetchSettledZaakDocuments(
        authProfile,
        docNameMA_PB,
        zaak
      );
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe(docNameMA);
    });

    test('should handle errors in fetching documents', async () => {
      remoteApi.post('/powerbrowser/SearchRequest').reply(500, 'some-error');

      const zaak = {
        id: 'test-zaak-id',
        dateRequest: '2023-01-01',
        dateEnd: null,
      } as unknown as BBVergunningFrontend;

      const result = await forTesting.fetchSettledZaakDocuments(
        authProfile,
        documentNamesMA_PB,
        zaak
      );
      expect(result).toHaveLength(0);
    });
  });

  describe('fetchZakenAdres', () => {
    test('should fetch addresses successfully', async () => {
      remoteApi.post('/powerbrowser/Link/GFO_ZAKEN/ADRESSEN/Table').reply(200, {
        records: [
          {
            fields: [{ fieldName: 'FMT_CAPTION', fieldValue: 'Test Address' }],
          },
        ],
      });

      const zaak = {
        id: 'test-zaak-id',
        dateRequest: '2023-01-01',
        dateEnd: null,
      } as unknown as BBVergunningFrontend;

      const result = await forTesting.fetchSettledZaakAdres(zaak);
      expect(result).toBe('Test Address');
    });
  });

  describe('transformZaakRaw', () => {
    beforeEach(() => {
      Mockdate.set('2023-01-01');
    });
    afterEach(() => {
      Mockdate.reset();
    });

    test('should transform zaak successfully', () => {
      const zaak: PBZaakRecord = {
        fmtCpn:
          'Z2024-WK000245 BenB aanvragen - Paulus van Hemertstraat 4 1 01-10-2024 Gereed Vergunningaanvraag behandelen Bed en breakfast',
        mainTableName: 'GFO_ZAKEN',
        id: '126088685',
        fields: [
          {
            fieldName: 'ZAAK_IDENTIFICATIE',
            text: 'Z2024-WK000245',
            fieldValue: 'Z2024-WK000245',
          },
          {
            fieldName: 'STARTDATUM',
            text: '01-10-2024',
            fieldValue: '2024-09-30T22:00:00.0000000Z',
          },
          {
            fieldName: 'EINDDATUM',
            text: '18-10-2024',
            fieldValue: '2024-10-17T22:00:00.0000000Z',
          },
          {
            fieldName: 'DATUM_TOT',
            text: '31-12-2024',
            fieldValue: '2024-12-30T23:00:00.0000000Z',
          },
          {
            fieldName: 'RESULTAAT_ID',
            text: 'Verleend zonder overgangsrecht',
            fieldValue: '722',
          },
        ],
      };

      const result = forTesting.transformZaakRaw(
        powerBrowserZaakTransformers[0],
        zaak
      );
      expect(result).toEqual({
        caseType: 'Bed en breakfast',
        dateDecision: '2024-10-17T22:00:00.0000000Z',
        dateEnd: '2024-12-30T23:00:00.0000000Z',
        dateRequest: '2024-09-30T22:00:00.0000000Z',
        dateStart: '2024-10-17T22:00:00.0000000Z',
        decision: 'Verleend',
        isVerleend: true,
        documents: [],
        id: '126088685',
        identifier: 'Z2024-WK000245',
        processed: true,
        isExpired: false,
        title: 'Vergunning bed & breakfast',
      });
    });
  });

  describe('fetchZakenByIds', () => {
    test('should fetch zaken by IDs successfully', async () => {
      remoteApi.get('/powerbrowser/record/GFO_ZAKEN/test-zaak-id').reply(200, [
        {
          id: 'test-zaak-id',
          fields: [
            { fieldName: 'RESULTAAT_ID', fieldValue: 'Verleend' },
            { fieldName: 'STARTDATUM', fieldValue: '2023-01-01' },
          ],
        },
      ]);

      const result = await forTesting.fetchZakenByIds(['test-zaak-id']);
      expect(result.status).toBe('OK');
      expect(result.content).toHaveLength(1);
    });

    test('should return an error if fetch fails', async () => {
      remoteApi
        .get('/powerbrowser/record/GFO_ZAKEN/test-zaak-id')
        .reply(500, 'some-error');

      const result = await forTesting.fetchZakenByIds(['test-zaak-id']);
      expect(result.status).toBe('ERROR');
    });
  });

  describe('transformPowerbrowserLinksResponse', () => {
    test('should transform powerbrowser links response', () => {
      const docNameMA = 'docNaamMA';
      const docNamePB = 'docNaamPB';
      const docNameMA_PB = { [docNameMA]: [docNamePB] };
      const responseData = {
        records: [
          {
            fields: [
              { fieldName: 'ID', fieldValue: 'test-doc-id' },
              {
                fieldName: 'OMSCHRIJVING',
                fieldValue: docNamePB,
              },
              { fieldName: 'CREATEDATE', fieldValue: '2023-01-01' },
            ],
          },
        ],
      } as SearchRequestResponse<'DOCLINK', PBDocumentFields[]>;

      const encryptSpy = vi
        .spyOn(encryptDecrypt, 'encryptSessionIdWithRouteIdParam')
        .mockReturnValue('test-encrypted-value');

      const result = forTesting.transformPowerbrowserDocLinksResponse(
        'test-session-id',
        docNameMA_PB,
        responseData
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'test-encrypted-value',
        title: docNameMA,
        download: docNameMA,
        datePublished: '2023-01-01',
        url: 'http://bff-api-host/api/v1/services/3448915414/documents/download?id=test-encrypted-value',
      });

      encryptSpy.mockRestore();
    });
  });
});

describe('getZaakStatus', () => {
  test('should return zaak status', () => {
    const steps = [
      { isActive: true, status: 'In behandeling' },
    ] as StatusLineItem[];
    const zaak = {
      decision: 'Verleend',
    } as unknown as BBVergunningFrontend;

    const result = forTesting.getDisplayStatus(zaak, steps);
    expect(result).toBe('Verleend');
  });

  test('should return last step status if no result', () => {
    const steps = [
      { isActive: true, status: 'In behandeling' },
    ] as StatusLineItem[];
    const zaak = {
      decision: null,
    } as unknown as BBVergunningFrontend;

    const result = forTesting.getDisplayStatus(zaak, steps);
    expect(result).toBe('In behandeling');
  });
});
