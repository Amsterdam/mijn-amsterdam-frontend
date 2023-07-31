import nock from 'nock';
import { encrypt } from '../../../universal/helpers/encrypt-decrypt';
import type { AuthProfileAndToken } from '../../helpers/app';
import bezwarenDocumenten from '../../mock-data/json/bezwaren-documents.json';
import bezwarenStatus from '../../mock-data/json/bezwaren-status.json';
import bezwarenApiResponse from '../../mock-data/json/bezwaren.json';
import {
  fetchBezwaarDocument,
  fetchBezwaren,
  fetchBezwarenNotifications,
} from './bezwaren';

describe('Bezwaren', () => {
  const requestId = '456';
  const documentId = 'e6ed38c3-a44a-4c16-97c1-89d7ebfca095';
  const [documentIdEncrypted] = encrypt(
    documentId,
    process.env.BFF_GENERAL_ENCRYPTION_KEY ?? ''
  );

  const profileAndToken: AuthProfileAndToken = {
    profile: {
      id: '123',
      authMethod: 'digid',
      profileType: 'private',
    },
    token: 'abc123',
  };

  afterAll(() => {
    nock.enableNetConnect();
    nock.restore();
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('fetch bezwaren', () => {
    beforeEach(() => {
      nock('http://localhost/zgw/v1')
        .post(`/zaken/_zoek?page=1`)
        .reply(200, bezwarenApiResponse)
        .get((uri) => uri.includes('/zaakinformatieobjecten'))
        .times(4)
        .reply(200, bezwarenDocumenten)
        .get((uri) => uri.includes('/statussen'))
        .times(4)
        .reply(200, bezwarenStatus)
        .get(`/enkelvoudiginformatieobjecten/${documentId}/download`)
        .reply(200, 'wat-document-data');
    });

    it('should return data in expected format', async () => {
      const res = await fetchBezwaren(requestId, profileAndToken);

      expect(bezwarenApiResponse.count).toEqual(res.content?.length);

      expect(res).toMatchSnapshot();
    });

    it('should return the right notifications', async () => {
      const res = await fetchBezwarenNotifications(requestId, profileAndToken);

      expect(res).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "notifications": Array [
              Object {
                "chapter": "BEZWAREN",
                "datePublished": "2023-04-25",
                "description": "Wij hebben uw bezwaar BI.21.014121.001 in behandeling genomen.",
                "id": "BI.21.014121.001",
                "link": Object {
                  "title": "Bekijk uw bezwaar",
                  "to": "/bezwaren/68cdd171-b4fd-44cc-a4d3-06b77341f20a",
                },
                "title": "Bezwaar in behandeling",
              },
              Object {
                "chapter": "BEZWAREN",
                "datePublished": "2023-04-03",
                "description": "Wij hebben uw bezwaar JB.22.000076.001 in behandeling genomen.",
                "id": "JB.22.000076.001",
                "link": Object {
                  "title": "Bekijk uw bezwaar",
                  "to": "/bezwaren/9804b064-90a3-43b0-bc7c-924f9939888d",
                },
                "title": "Bezwaar in behandeling",
              },
              Object {
                "chapter": "BEZWAREN",
                "datePublished": "2022-11-04",
                "description": "Wij hebben uw bezwaar ZAAK2 in behandeling genomen.",
                "id": "ZAAK2",
                "link": Object {
                  "title": "Bekijk uw bezwaar",
                  "to": "/bezwaren/cc117d91-1b00-4bae-bbdd-9ea3a6d6d185",
                },
                "title": "Bezwaar in behandeling",
              },
              Object {
                "chapter": "BEZWAREN",
                "datePublished": "2022-11-04",
                "description": "Wij hebben uw bezwaar ZAAK3 in behandeling genomen.",
                "id": "ZAAK3",
                "link": Object {
                  "title": "Bekijk uw bezwaar",
                  "to": "/bezwaren/956541b6-7a25-4132-9592-0a509bc7ace0",
                },
                "title": "Bezwaar in behandeling",
              },
            ],
          },
          "status": "OK",
        }
      `);
    });

    it('should be possible to download a document', async () => {
      const documentResponse = await fetchBezwaarDocument(
        requestId,
        profileAndToken,
        documentIdEncrypted
      );

      //@ts-ignore
      expect(documentResponse?.message).toEqual(undefined);
      expect(documentResponse.status).toEqual(200);
      // expect(documentResponse.data).toEqual(new Buffer('wat-document-data'));
    });
  });
});
