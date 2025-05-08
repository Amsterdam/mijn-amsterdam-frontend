import uid from 'uid-safe';

import {
  fetchDecosDocumentList,
  fetchDecosZaken,
  fetchDecosWorkflowDates,
  fetchDecosZakenFromSource,
  forTesting,
  fetchDecosTermijnen,
  fetchDecosLinkedField,
} from './decos-service';
import {
  DecosDocumentSource,
  DecosZaakSource,
  DecosZakenResponse,
  type DecosWorkflowResponse,
  type DecosZaakBase,
  type DecosZaakTransformer,
} from './decos-types';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { jsonCopy, range } from '../../../universal/helpers/utils';
import { axiosRequest } from '../../helpers/source-api-request';
import type { WerkzaamhedenEnVervoerOpStraat } from '../vergunningen/config-and-types';
import {
  decosCaseToZaakTransformers,
  decosZaakTransformers,
} from '../vergunningen/decos-zaken';

vi.mock('../../../server/helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encryptSessionIdWithRouteIdParam: () => {
      return 'test-encrypted-id';
    },
    decrypt: () => 'session-id:e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  };
});

const zakenSource = {
  count: 1,
  content: [
    {
      key: '084239C942C647F79F1C2B5CCF8DC5DA',
      fields: {
        title: 'In behandeling',
        text45: 'Werk en vervoer op straat',
        mark: 'Z/23/2230424',
        processed: false,
        document_date: '2023-11-06T00:00:00',
        date6: '2023-11-27T00:00:00',
        date7: '2023-12-14T00:00:00',
        text9: '95GHZ4',
        text49: '95GHZ4',
      },
      links: [],
    },
  ],
};

const workflows = {
  count: 1,
  content: [
    {
      worklfowType: 'FOLDER',
      workflowType: 'FOLDER',
      mainItemBookKey: 'IETS_VAN_EEN_ID',
      key: '123-abc-000',
      workflowName: 'Zaak-workflow-naam - vergunning Versie 77899',
    },
  ],
};

const workflowInstance: DecosWorkflowResponse = {
  count: 1,
  content: [
    {
      fields: {
        date1: '2021-09-13T17:09:00',
        text7: 'Zaak - behandelen',
      },
      key: '',
      links: [],
    },
  ],
};

const termijns = {
  count: 1,
  content: [
    {
      fields: {
        date2: '2025-02-20T10:31:20',
        date4: '2025-02-17T00:00:00',
        date5: '2025-02-20T00:00:00',
        itemtype_key: 'TERMIJNEN',
        mark: 'Z/25/000001',
        subject1: 'Verzoek aanvullende gegevens',
      },
    },
  ],
};

const linkedItem = {
  count: 1,
  content: [
    {
      key: '1234',
      fields: {
        itemtype_key: 'LINKEDFIELD',
        mark: 'Z/25/0000001-10001',
      },
    },
  ],
};

const documents: DecosZakenResponse<DecosDocumentSource[]> = {
  count: 1,
  content: [
    {
      key: 'doc-key',
      fields: {
        subject1: 'document-123123.pdf',
        received_date: '2024-06-06',
        sequence: 8,
        mark: 'D/4379600',
        text39: 'Definitief',
        text40: 'Beperkt openbaar',
        text41: 'Systeem - Factuurregel Stadsloket automatisch',
        itemtype_key: 'DOCUMENT',
      },
      links: [],
    },
  ],
};

const blob = {
  content: [
    {
      key: 'blob-key',
      fields: {
        bol10: true,
      },
    },
  ],
};

/**
 * Initally the servic performs a series of searches for zaken based on BFF_DECOS_API_ADRES_BOEKEN_BSN
 * In the tests there are 4 book keys defined. B1,B2,B3,B4. Everywhere you see .times(numberOfAddressBooksToSearch) it's to cover the
 * booksearch requests performed at the same time (Promise.all([search1,search2,search3,search4]))
 */

describe('decos-service', () => {
  const authProfileAndToken = getAuthProfileAndToken();
  const numberOfAddressBooksToSearch =
    process.env.BFF_DECOS_API_ADRES_BOEKEN_BSN?.split(',').length ?? 0;

  /**
   * Testing Exported service methods
   */
  describe('fetchDecosZakenSource', async () => {
    test('Error response in userkeys', async () => {
      remoteApi
        .post(/\/decos\/search\/books/)
        .times(numberOfAddressBooksToSearch)
        .replyWithError('request failed');

      const responseData = await fetchDecosZakenFromSource(authProfileAndToken);
      expect(responseData.status).toBe('ERROR');
      expect(responseData.content).toBe(null);
    });

    test('Error response in folders', async () => {
      remoteApi
        .post(/\/decos\/search\/books/)
        .times(numberOfAddressBooksToSearch)
        .reply(200, {
          itemDataResultSet: {
            content: [{ key: '123456789' }],
          },
        });

      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(numberOfAddressBooksToSearch)
        .replyWithError('bad request to folder');

      const responseData = await fetchDecosZakenFromSource(authProfileAndToken);

      expect(responseData.status).toBe('ERROR');
      expect(responseData.content).toBe(null);
    });

    test('Error response in one of the folder requests', async () => {
      remoteApi
        .post(/\/decos\/search\/books/)
        .times(numberOfAddressBooksToSearch)
        .reply(200, {
          itemDataResultSet: {
            content: [{ key: '123456789' }],
          },
        });
      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(1)
        .replyWithError('bad request');
      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(numberOfAddressBooksToSearch - 1)
        .reply(200);

      const responseData = await fetchDecosZakenFromSource(authProfileAndToken);
      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": null,
          "message": "bad request",
          "status": "ERROR",
        }
      `);
    });
  });

  describe('fetchDecosWorkflowDate', async () => {
    test('No content', async () => {
      remoteApi.get(/\/decos\/items\/zaak-id-1\/workflows/).reply(200);
      remoteApi
        .get(/\/decos\/items\/123-abc-000\/workflowlinkinstances/)
        .reply(200);

      const responseData = await fetchDecosWorkflowDates('zaak-id-1', [
        'zaak - behandelen',
      ]);

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": {},
          "status": "OK",
        }
      `);
    });

    test('With date', async () => {
      remoteApi
        .get(/\/decos\/items\/zaak-id-1\/workflows/)
        .reply(200, workflows);

      remoteApi
        .get(/\/decos\/items\/123-abc-000\/workflowlinkinstances/)
        .reply(200, workflowInstance);

      const responseData = await fetchDecosWorkflowDates('zaak-id-1', [
        'Zaak - behandelen',
      ]);

      expect(responseData).toMatchObject({
        content: { 'Zaak - behandelen': '2021-09-13T17:09:00' },
        status: 'OK',
      });
    });

    test('Without date', async () => {
      remoteApi
        .get(/\/decos\/items\/zaak-id-1\/workflows/)
        .reply(200, workflows);

      const workflowInstance2: typeof workflowInstance =
        jsonCopy(workflowInstance);
      const instance1 = workflowInstance2.content[0];
      const fields = instance1.fields as Partial<typeof instance1.fields>;
      delete fields.text7;

      remoteApi
        .get(/\/decos\/items\/123-abc-000\/workflowlinkinstances/)
        .reply(200, workflowInstance2);

      const responseData = await fetchDecosWorkflowDates('zaak-id-1', [
        'Zaak - behandelen',
      ]);

      expect(responseData).toMatchObject({
        content: { 'Zaak - behandelen': null },
        status: 'OK',
      });
    });
  });

  describe('fetchDecosTermijns', async () => {
    test('Termijnen does not exist on item', async () => {
      remoteApi.get(/\/decos\/items\/zaak-id-1\/termijnens/).reply(404);

      const responseData = await fetchDecosTermijnen('zaak-id-1', ['Termijn']);

      expect(responseData).toMatchObject({
        content: null,
        status: 'ERROR',
      });
    });

    test('No content', async () => {
      remoteApi.get(/\/decos\/items\/zaak-id-1\/termijnens/).reply(200);

      const responseData = await fetchDecosTermijnen('zaak-id-1', ['Termijn']);

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": [],
          "status": "OK",
        }
      `);
    });

    test('Has termijn', async () => {
      remoteApi
        .get(/\/decos\/items\/zaak-id-1\/termijnens/)
        .reply(200, termijns);

      const responseData = await fetchDecosTermijnen('zaak-id-1', ['Termijn']);

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": [
            {
              "dateEnd": "2025-02-20T00:00:00",
              "dateStart": "2025-02-17T00:00:00",
              "type": "Verzoek aanvullende gegevens",
            },
          ],
          "status": "OK",
        }
      `);
    });
  });

  describe('fetchDecosLinkedItem', async () => {
    test('Linked field does not exist on item', async () => {
      remoteApi.get(/\/decos\/items\/zaak-id-1\/linkedField/).reply(404);

      const responseData = await fetchDecosLinkedField(
        'zaak-id-1',
        'linkedField'
      );

      expect(responseData).toMatchObject({
        content: null,
        status: 'ERROR',
      });
    });

    test('No content', async () => {
      remoteApi.get(/\/decos\/items\/zaak-id-1\/linkedField/).reply(200);

      const responseData = await fetchDecosLinkedField(
        'zaak-id-1',
        'linkedField'
      );

      expect(responseData).toStrictEqual({
        content: [],
        status: 'OK',
      });
    });

    test('Has linkedItem', async () => {
      remoteApi
        .get(/\/decos\/items\/zaak-id-1\/linkedField/)
        .reply(200, linkedItem);

      const responseData = await fetchDecosLinkedField(
        'zaak-id-1',
        'linkedField'
      );

      expect(responseData).toStrictEqual({
        content: [
          {
            itemtype_key: 'LINKEDFIELD',
            mark: 'Z/25/0000001-10001',
            key: '1234',
          },
        ],
        status: 'OK',
      });
    });
  });

  describe('fetchDecosDocumentList', async () => {
    test('No content', async () => {
      remoteApi.get(/\/decos\/items\/zaak-id-2\/documents/).reply(200, []);

      const responseData = await fetchDecosDocumentList('xx', 'zaak-id-2');
      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": [],
          "status": "OK",
        }
      `);
    });

    test('With valid pdf docs', async () => {
      remoteApi
        .get(/\/decos\/items\/zaak-id-2\/documents/)
        .reply(200, documents);
      remoteApi.get(/\/decos\/items\/doc-key\/blob/).reply(200, blob);

      const responseData = await fetchDecosDocumentList('xx', 'zaak-id-2');
      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": [
            {
              "datePublished": "2024-06-06",
              "id": "D/4379600",
              "key": "blob-key",
              "title": "Systeem - Factuurregel Stadsloket automatisch",
              "url": "http://bff-api-host/api/v1/services/decos/documents/download?id=test-encrypted-id",
            },
          ],
          "status": "OK",
        }
      `);
    });

    test('Without valid PDF docs', async () => {
      remoteApi
        .get(/\/decos\/items\/zaak-id-2\/documents/)
        .reply(200, documents);

      const blob2: typeof blob = jsonCopy(blob);
      blob2.content[0].fields.bol10 = false;
      remoteApi.get(/\/decos\/items\/doc-key\/blob/).reply(200, blob2);

      const responseData = await fetchDecosDocumentList('xx', 'zaak-id-2');
      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": [],
          "status": "OK",
        }
      `);
    });
  });

  describe('fetchDecosZaken', async () => {
    test('Fail response', async () => {
      remoteApi
        .post(/\/decos\/search\/books/)
        .times(numberOfAddressBooksToSearch)
        .replyWithError('Booksearch failed');

      const responseData = await fetchDecosZaken(
        authProfileAndToken,
        decosZaakTransformers
      );

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": null,
          "message": "Booksearch failed",
          "status": "ERROR",
        }
      `);
    });

    test('Success response', async () => {
      remoteApi
        .post(/\/decos\/search\/books/)
        .times(numberOfAddressBooksToSearch)
        .reply(200, {
          itemDataResultSet: {
            content: [{ key: '123456789' }],
          },
        });

      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(numberOfAddressBooksToSearch)
        .reply(200, zakenSource);

      const axiosSpy = vi.spyOn(axiosRequest, 'request');

      const responseData = await fetchDecosZaken(
        authProfileAndToken,
        decosZaakTransformers
      );

      const calls = axiosSpy.mock.calls.map((call) => {
        return call[0].url;
      });

      expect(calls.length).toBe(12);
      expect(
        calls
          .slice(0, numberOfAddressBooksToSearch)
          .every((url) => url === 'http://remote-api-host/decos/search/books')
      ).toBe(true);
      expect(
        calls
          .slice(numberOfAddressBooksToSearch, numberOfAddressBooksToSearch * 2)
          .every((url) =>
            url?.startsWith(
              'http://remote-api-host/decos/items/123456789/folders'
            )
          )
      ).toBe(true);
      expect(
        calls
          .slice(
            numberOfAddressBooksToSearch * 2,
            numberOfAddressBooksToSearch * 3
          )
          .every(
            (url) =>
              url ===
              'http://remote-api-host/decos/items/084239C942C647F79F1C2B5CCF8DC5DA/workflows'
          )
      ).toBe(true);

      expect(responseData.status).toBe('OK');
      expect(responseData.content?.length).toBe(4);

      axiosSpy.mockRestore();
    });
  });

  /**
   * Testing non-exported methods
   */
  describe('getUserKeys', () => {
    test('Fetches user keys', async () => {
      remoteApi
        .post(/\/decos\/search\/books/)
        .reply(200, {
          itemDataResultSet: {
            content: [{ key: 'A' }, { key: 'B' }, { key: 'C' }],
          },
        })
        .post(/\/decos\/search\/books/)
        .reply(200, {
          itemDataResultSet: {
            content: [],
          },
        })
        .post(/\/decos\/search\/books/)
        .reply(200, {
          itemDataResultSet: {
            content: [{ key: 'D' }, { key: 'E' }, { key: 'F' }],
          },
        })
        .post(/\/decos\/search\/books/)
        .reply(200);

      const userKeys = await forTesting.getUserKeys(authProfileAndToken);

      expect(userKeys.content).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    });

    test('Failed requests', async () => {
      remoteApi
        .post(/\/decos\/search\/books/)
        .reply(200, {
          itemDataResultSet: {
            content: [{ key: 'A' }, { key: 'B' }, { key: 'C' }],
          },
        })
        .post(/\/decos\/search\/books/)
        .times(numberOfAddressBooksToSearch - 1)
        .replyWithError('Suddenly errors in the requests...');

      const userKeys = await forTesting.getUserKeys(authProfileAndToken);

      expect(userKeys.status).toBe('ERROR');
      expect(userKeys.content).toBe(null);
    });
  });

  describe('filterValidDocument', () => {
    test('Niet definitief', () => {
      const isValid = forTesting.filterValidDocument({
        fields: { text39: 'foo.bar' },
      } as unknown as DecosDocumentSource);
      expect(isValid).toBe(false);
    });
    test('Niet openbaar', () => {
      const isValid = forTesting.filterValidDocument({
        fields: { text39: 'definitief', text40: 'geheim' },
      } as unknown as DecosDocumentSource);
      expect(isValid).toBe(false);
    });
    test('Niet van toepassing', () => {
      const isValid = forTesting.filterValidDocument({
        fields: { text39: 'definitief', text40: 'openbaar', text41: 'nvt' },
      } as unknown as DecosDocumentSource);
      expect(isValid).toBe(false);
    });
    test('Alles ok!', () => {
      const isValid = forTesting.filterValidDocument({
        fields: { text39: 'definitief', text40: 'openbaar', text41: 'ok' },
      } as unknown as DecosDocumentSource);
      expect(isValid).toBe(true);
    });
  });

  describe('getZakenByUserKey', () => {
    test('Fail', async () => {
      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(numberOfAddressBooksToSearch)
        .replyWithError('De api geeft een error.');

      const responseData = await forTesting.getZakenByUserKey('123456789');

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": null,
          "message": "De api geeft een error.",
          "status": "ERROR",
        }
      `);
    });

    test('Bad content: bad json', async () => {
      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(numberOfAddressBooksToSearch)
        .reply(200, 'abc');

      const responseData = await forTesting.getZakenByUserKey('123456789');

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": null,
          "message": "Unexpected token 'a', "abc" is not valid JSON",
          "status": "ERROR",
        }
      `);
    });

    test('Bad content: valid json', async () => {
      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(numberOfAddressBooksToSearch)
        .reply(200, '"abc"');

      const responseData = await forTesting.getZakenByUserKey('123456789');

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": [],
          "status": "OK",
        }
      `);
    });

    test('Called with filter based on caseTypes', async () => {
      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .query((queryObject) => {
          return (
            queryObject.filter ===
            `text45 eq 'Aanbieden van diensten' or text45 eq 'VOB'`
          );
        })
        .times(numberOfAddressBooksToSearch)
        .reply(200, zakenSource);

      const axiosSpy = vi.spyOn(axiosRequest, 'request');

      const dienstenTransformer =
        decosCaseToZaakTransformers['Aanbieden van diensten'];
      const vobTransformer = decosCaseToZaakTransformers.VOB;
      const transformers = [
        dienstenTransformer,
        { ...vobTransformer, additionalSelectFields: ['text45', 'order66'] },
      ] as DecosZaakTransformer<DecosZaakBase>[];

      const responseData = await forTesting.getZakenByUserKey(
        '123456789',
        transformers
      );

      const selectFields = forTesting.getSelectFields(transformers);

      expect(axiosSpy.mock.calls[0][0].params.select).toStrictEqual(
        selectFields
      );

      expect(responseData.content?.length).toBe(1);

      axiosSpy.mockRestore();
    });

    test('Success', async () => {
      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(numberOfAddressBooksToSearch)
        .reply(200, zakenSource);

      const responseData = await forTesting.getZakenByUserKey('123456789');

      expect(responseData.content?.length).toBe(1);
    });
  });

  describe('transformDecosDocumentListResponse', () => {
    test('Success', async () => {
      remoteApi.get(/\/decos\/items\/doc-key\/blob/).reply(200, blob);
      const documentsTransformed =
        await forTesting.transformDecosDocumentListResponse('xx', documents);
      expect(documentsTransformed).toEqual([
        {
          datePublished: '2024-06-06',
          id: 'D/4379600',
          key: 'blob-key',
          title: 'Systeem - Factuurregel Stadsloket automatisch',
          url: 'http://bff-api-host/api/v1/services/decos/documents/download?id=test-encrypted-id',
        },
      ]);
    });
  });

  describe('transformDecosWorkflowDateResponse', () => {
    test('No date', () => {
      const workflowInstance2: typeof workflowInstance =
        jsonCopy(workflowInstance);
      const fields = workflowInstance2.content[0].fields;
      delete (fields as Partial<typeof fields>).date1;

      const date = forTesting.transformDecosWorkflowDateResponse(
        ['Zaak - behandelen'],
        workflowInstance2
      );

      expect(date).toMatchObject({ 'Zaak - behandelen': null });
    });

    test('Has date', () => {
      const date = forTesting.transformDecosWorkflowDateResponse(
        ['Zaak - behandelen'],
        workflowInstance
      );
      expect(date).toMatchObject({
        'Zaak - behandelen': workflowInstance.content[0].fields.date1,
      });
    });

    test('Wrong step title', () => {
      const date = forTesting.transformDecosWorkflowDateResponse(
        ['Zaak - in behandeling'],
        workflowInstance
      );
      expect(date).toMatchObject({ 'Zaak - in behandeling': null });
    });
  });

  describe('transformDecosWorkflowKeysResponse', () => {
    test('No key', () => {
      const key = forTesting.transformDecosWorkflowKeysResponse({
        content: [],
        count: 0,
      });
      expect(key).toStrictEqual([]);
    });

    test('Has key', () => {
      const keys = forTesting.transformDecosWorkflowKeysResponse({
        content: [{ key: 'test-key-a' }, { key: 'test-key-b' }],
        count: 2,
      });
      expect(keys).toStrictEqual(['test-key-a', 'test-key-b']);
    });
  });

  describe('transformDecosZaakResponse', () => {
    test('Transforms zaken', async () => {
      remoteApi
        .get(/\/decos\/items\/084239C942C647F79F1C2B5CCF8DC5DA\/workflows/)
        .reply(200, workflows);

      const workflowInstance2: typeof workflowInstance =
        jsonCopy(workflowInstance);

      const [instance1] = workflowInstance2.content;
      instance1.fields.text7 = 'Werk en vervoer op straat - Behandelen';
      instance1.fields.date1 = '2024-05-04';

      remoteApi
        .get(/\/decos\/items\/123-abc-000\/workflowlinkinstances/)
        .reply(200, workflowInstance2);

      const transformed = await forTesting.transformDecosZaakResponse(
        decosZaakTransformers,
        zakenSource.content[0]
      );

      expect(transformed).toMatchObject({
        caseType: 'Werk en vervoer op straat',
        dateDecision: null,
        dateEnd: '2023-12-14T00:00:00',
        dateRequest: '2023-11-06T00:00:00',
        dateStart: '2023-11-27T00:00:00',
        decision: null,
        id: 'Z-23-2230424',
        identifier: 'Z/23/2230424',
        kentekens: '95GHZ4',
        key: '084239C942C647F79F1C2B5CCF8DC5DA',
        location: null,
        processed: false,
        statusDates: [
          {
            status: 'In behandeling',
            datePublished: '2024-05-04',
          },
        ],
        title: 'Werkzaamheden en vervoer op straat (95GHZ4)',
        werkzaamheden: [],
      });
    });

    test('Excluded', async () => {
      const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
      zaak.fields.dfunction = 'buiten behandeling';

      const transformed = await forTesting.transformDecosZaakResponse(
        decosZaakTransformers,
        zaak
      );
      expect(transformed).toBe(null);
    });

    test('Uses after transform', async () => {
      const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
      zaak.fields.bol17 = true;
      zaak.fields.bol8 = true;

      const transformed: WerkzaamhedenEnVervoerOpStraat | null =
        await forTesting.transformDecosZaakResponse(
          decosZaakTransformers,
          zaak
        );
      expect(transformed).not.toBe(null);
      expect(transformed).toHaveProperty('werkzaamheden');
      expect(transformed?.werkzaamheden).toStrictEqual([
        'Werkzaamheden verrichten in de nacht',
        'Verhuizing tussen twee locaties binnen Amsterdam',
      ]);
    });

    test('Override decision', async () => {
      const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
      zaak.fields.dfunction = null;
      zaak.fields.processed = true;

      const transformed = await forTesting.transformDecosZaakResponse(
        decosZaakTransformers,
        zaak
      );
      expect(transformed?.decision).toBe('Zie besluit');
    });

    test('Null response when no valid transformer', async () => {
      const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
      const transformed = await forTesting.transformDecosZaakResponse([], zaak);
      expect(transformed).toBe(null);
    });
  });

  describe('transformDecosZakenResponse', () => {
    test('Transforms and sorts', async () => {
      const zaken = range(0, 3).map((n) => {
        const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
        return {
          ...zaak,
          fields: {
            ...zaak.fields,
            mark: `${n} - xxx`,
          },
        };
      });
      const zakenTransformed = await forTesting.transformDecosZakenResponse(
        decosZaakTransformers,
        zaken
      );
      expect(
        zakenTransformed.map(({ identifier }) => identifier)
      ).toStrictEqual(['3 - xxx', '2 - xxx', '1 - xxx', '0 - xxx']);
    });

    test('Empty response when no valid transformer', async () => {
      const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
      const zakenTransformed = await forTesting.transformDecosZakenResponse(
        [],
        [zaak]
      );
      expect(zakenTransformed).toStrictEqual([]);
    });
  });
});
