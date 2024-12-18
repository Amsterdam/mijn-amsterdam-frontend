import uid from 'uid-safe';

import {
  fetchDecosDocumentList,
  fetchDecosZaken,
  fetchDecosWorkflowDate,
  fetchDecosZakenFromSource,
  forTesting,
} from './decos-service';
import {
  DecosDocumentSource,
  DecosZaakSource,
  DecosZakenResponse,
} from './decos-types';
import { remoteApi } from '../../../testing/utils';
import { jsonCopy, range } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { decosZaakTransformers } from '../vergunningen-v2/decos-zaken';

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

const workflowInstance = {
  count: 1,
  content: [
    {
      fields: {
        mark: 'Afgehandeld',
        date1: '2021-09-13T17:09:00',
        date2: '2021-09-13T17:09:00',
        text7: 'Zaak - behandelen',
        sequence: 1.0,
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
  const authProfileAndToken: AuthProfileAndToken = {
    profile: {
      id: 'b123123123',
      authMethod: 'digid',
      profileType: 'private',
      sid: 's999999',
    },
    token: '111222333',
  };
  let reqID: RequestID = '456-ABC';

  const numberOfAddressBooksToSearch =
    process.env.BFF_DECOS_API_ADRES_BOEKEN_BSN?.split(',').length ?? 0;

  beforeEach(() => {
    reqID = uid.sync(18);
  });

  /**
   * Testing Exported service methods
   */
  describe('fetchDecosVergunningenSource', async () => {
    test('Error response in userkeys', async () => {
      remoteApi.post(/\/decos\/search\/books/).replyWithError('request failed');

      const responseData = await fetchDecosZakenFromSource(
        reqID,
        authProfileAndToken
      );
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
        .reply(200, zakenSource);

      const responseData = await fetchDecosZakenFromSource(
        reqID,
        authProfileAndToken
      );

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
        .replyWithError('bad request');

      const responseData = await fetchDecosZakenFromSource(
        reqID,
        authProfileAndToken
      );
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

      const responseData = await fetchDecosWorkflowDate(
        reqID,
        'zaak-id-1',
        'zaak - behandelen'
      );

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": null,
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

      const responseData = await fetchDecosWorkflowDate(
        reqID,
        'zaak-id-1',
        'Zaak - behandelen'
      );

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": "2021-09-13T17:09:00",
          "status": "OK",
        }
      `);
    });

    test('Without date', async () => {
      remoteApi
        .get(/\/decos\/items\/zaak-id-1\/workflows/)
        .reply(200, workflows);

      const workflowInstance2: typeof workflowInstance =
        jsonCopy(workflowInstance);
      const [instance1] = workflowInstance2.content;
      delete (instance1 as any).fields.text7;

      remoteApi
        .get(/\/decos\/items\/123-abc-000\/workflowlinkinstances/)
        .reply(200, workflowInstance2);

      const responseData = await fetchDecosWorkflowDate(
        reqID,
        'zaak-id-1',
        'Zaak - behandelen'
      );

      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": null,
          "status": "OK",
        }
      `);
    });
  });

  describe('fetchDecosDocumentList', async () => {
    test('No content', async () => {
      remoteApi.get(/\/decos\/items\/zaak-id-2\/documents/).reply(200, []);

      const responseData = await fetchDecosDocumentList(reqID, 'zaak-id-2');
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

      const responseData = await fetchDecosDocumentList(reqID, 'zaak-id-2');
      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": [
            {
              "datePublished": "2024-06-06",
              "id": "D/4379600",
              "key": "blob-key",
              "title": "Systeem - Factuurregel Stadsloket automatisch",
              "url": "",
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

      const responseData = await fetchDecosDocumentList(reqID, 'zaak-id-2');
      expect(responseData).toMatchInlineSnapshot(`
        {
          "content": [],
          "status": "OK",
        }
      `);
    });
  });

  describe('fetchDecosVergunningen', async () => {
    test('Fail response', async () => {
      remoteApi
        .post(/\/decos\/search\/books/)
        .times(numberOfAddressBooksToSearch)
        .replyWithError('Booksearch failed');

      const responseData = await fetchDecosZaken(
        reqID,
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

      const responseData = await fetchDecosZaken(
        reqID,
        authProfileAndToken,
        decosZaakTransformers
      );

      expect(responseData.status).toBe('OK');
      expect(responseData.content?.length).toBe(4);
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

      const userKeys = await forTesting.getUserKeys(reqID, authProfileAndToken);

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

      const userKeys = await forTesting.getUserKeys(reqID, authProfileAndToken);

      expect(userKeys.status).toBe('ERROR');
      expect(userKeys.content).toBe(null);
    });
  });

  describe('filterValidDocument', () => {
    test('Niet definitief', () => {
      const isValid = forTesting.filterValidDocument({
        fields: { text39: 'foo.bar' },
      } as any);
      expect(isValid).toBe(false);
    });
    test('Niet openbaar', () => {
      const isValid = forTesting.filterValidDocument({
        fields: { text39: 'definitief', text40: 'geheim' },
      } as any);
      expect(isValid).toBe(false);
    });
    test('Niet van toepassing', () => {
      const isValid = forTesting.filterValidDocument({
        fields: { text39: 'definitief', text40: 'openbaar', text41: 'nvt' },
      } as any);
      expect(isValid).toBe(false);
    });
    test('Alles ok!', () => {
      const isValid = forTesting.filterValidDocument({
        fields: { text39: 'definitief', text40: 'openbaar', text41: 'ok' },
      } as any);
      expect(isValid).toBe(true);
    });
  });

  describe('getZakenByUserKey', () => {
    test('Fail', async () => {
      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(numberOfAddressBooksToSearch)
        .replyWithError('De api geeft een error.');

      const responseData = await forTesting.getZakenByUserKey(
        reqID,
        '123456789'
      );

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

      const responseData = await forTesting.getZakenByUserKey(
        reqID,
        '123456789'
      );

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

      const responseData = await forTesting.getZakenByUserKey(
        reqID,
        '123456789'
      );

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
            'text45 eq Aanbieden van diensten or text45 eq GPK'
          );
        })
        .times(numberOfAddressBooksToSearch)
        .reply(200, zakenSource);

      const responseData = await forTesting.getZakenByUserKey(
        reqID,
        '123456789',
        ['Aanbieden van diensten', 'GPK']
      );

      expect(responseData.content?.length).toBe(1);
    });

    test('Success', async () => {
      remoteApi
        .get(/\/decos\/items\/123456789\/folders/)
        .times(numberOfAddressBooksToSearch)
        .reply(200, zakenSource);

      const responseData = await forTesting.getZakenByUserKey(
        reqID,
        '123456789'
      );

      expect(responseData.content?.length).toBe(1);
    });
  });

  describe('transformDecosDocumentListResponse', () => {
    test('Success', async () => {
      remoteApi.get(/\/decos\/items\/doc-key\/blob/).reply(200, blob);
      const documentsTransformed =
        await forTesting.transformDecosDocumentListResponse(reqID, documents);
      expect(documentsTransformed).toMatchInlineSnapshot(`
        [
          {
            "datePublished": "2024-06-06",
            "id": "D/4379600",
            "key": "blob-key",
            "title": "Systeem - Factuurregel Stadsloket automatisch",
            "url": "",
          },
        ]
      `);
    });
  });

  describe('transformDecosWorkflowDateResponse', () => {
    test('No date', () => {
      const workflowInstance2: typeof workflowInstance =
        jsonCopy(workflowInstance);
      delete (workflowInstance2 as any).content[0].fields.date1;

      const date = forTesting.transformDecosWorkflowDateResponse(
        'Zaak - behandelen',
        workflowInstance2
      );

      expect(date).toBe(null);
    });

    test('Has date', () => {
      const date = forTesting.transformDecosWorkflowDateResponse(
        'Zaak - behandelen',
        workflowInstance
      );
      expect(date).toBe(workflowInstance.content[0].fields.date1);
    });

    test('Wrong step title', () => {
      const date = forTesting.transformDecosWorkflowDateResponse(
        'Zaak - in behandeling',
        workflowInstance
      );
      expect(date).toBe(null);
    });
  });

  describe('transformDecosWorkflowKeysResponse', () => {
    test('No key', () => {
      const key = forTesting.transformDecosWorkflowKeysResponse({
        content: [],
      });
      expect(key).toBe(null);
    });

    test('Has key', () => {
      const key = forTesting.transformDecosWorkflowKeysResponse({
        content: [{ key: 'test-key-a' }, { key: 'test-key-b' }],
      });
      expect(key).toBe('test-key-b');
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
      instance1.fields.text7 = 'Status - In behandeling';
      instance1.fields.date1 = '2024-05-04';

      remoteApi
        .get(/\/decos\/items\/123-abc-000\/workflowlinkinstances/)
        .reply(200, workflowInstance2);

      const transformed = await forTesting.transformDecosZaakResponse(
        reqID,
        decosZaakTransformers,
        zakenSource.content[0]
      );

      expect(transformed).toMatchInlineSnapshot(`
        {
          "caseType": "Werk en vervoer op straat",
          "dateDecision": null,
          "dateEnd": "2023-12-14T00:00:00",
          "dateInBehandeling": "2024-05-04",
          "dateRequest": "2023-11-06T00:00:00",
          "dateStart": "2023-11-27T00:00:00",
          "decision": null,
          "id": "Z-23-2230424",
          "identifier": "Z/23/2230424",
          "kentekens": "95GHZ4",
          "key": "084239C942C647F79F1C2B5CCF8DC5DA",
          "location": null,
          "processed": false,
          "status": "In behandeling",
          "title": "Werkzaamheden en vervoer op straat (95GHZ4)",
          "werkzaamheden": [],
        }
      `);
    });

    test('Excluded', async () => {
      const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
      zaak.fields.dfunction = 'buiten behandeling';

      const transformed = await forTesting.transformDecosZaakResponse(
        reqID,
        decosZaakTransformers,
        zaak
      );
      expect(transformed).toBe(null);
    });

    test('Uses after transform', async () => {
      const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
      zaak.fields.bol17 = true;
      zaak.fields.bol8 = true;

      const transformed = await forTesting.transformDecosZaakResponse(
        reqID,
        decosZaakTransformers,
        zaak
      );
      expect(transformed).not.toBe(null);
      expect(transformed!).toHaveProperty('werkzaamheden');
      expect((transformed as any).werkzaamheden).toStrictEqual([
        'Werkzaamheden verrichten in de nacht',
        'Verhuizing tussen twee locaties binnen Amsterdam',
      ]);
    });

    test('Override decision', async () => {
      const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
      zaak.fields.dfunction = null;
      zaak.fields.processed = true;

      const transformed = await forTesting.transformDecosZaakResponse(
        reqID,
        decosZaakTransformers,
        zaak
      );
      expect(transformed?.decision).toBe('Zie besluit');
    });

    test('Null response when no valid transformer', async () => {
      const zaak: DecosZaakSource = jsonCopy(zakenSource.content[0]);
      const transformed = await forTesting.transformDecosZaakResponse(
        reqID,
        [],
        zaak
      );
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
        reqID,
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
        reqID,
        [],
        [zaak]
      );
      expect(zakenTransformed).toStrictEqual([]);
    });
  });
});
