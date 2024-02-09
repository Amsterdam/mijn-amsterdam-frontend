import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { remoteApi } from '../../../test-utils';
import { encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { AuthProfileAndToken } from '../../helpers/app';
import bezwarenDocumenten from '../../mock-data/json/bezwaren-documents.json';
import bezwarenStatus from '../../mock-data/json/bezwaren-status.json';
import bezwarenApiResponse from '../../mock-data/json/bezwaren.json';
import {
  fetchBezwaarDocument,
  fetchBezwaren,
  fetchBezwarenNotifications,
} from './bezwaren';

const endpointBase = '/bezwaren/zgw/v1/zaken';

vi.mock('../../../universal/helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encrypt: () => {
      return ['test-encrypted-id'];
    },
    decrypt: () => 'e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  };
});

describe('Bezwaren', () => {
  const requestId = '456';
  const documentId = 'e6ed38c3-a44a-4c16-97c1-89d7ebfca095';
  const documentIdEncrypted = 'test-encrypted-id';

  const profileAndToken: AuthProfileAndToken = {
    profile: {
      id: '123',
      authMethod: 'digid',
      profileType: 'private',
    },
    token: 'abc123',
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetch bezwaren', () => {
    beforeEach(() => {
      remoteApi
        .post(`${endpointBase}/_zoek?page=1`)
        .reply(200, bezwarenApiResponse)
        .get((uri) => uri.includes('/enkelvoudiginformatieobjecten'))
        .times(4)
        .reply(200, bezwarenDocumenten)
        .get((uri) => uri.includes('/statussen'))
        .times(4)
        .reply(200, bezwarenStatus);
    });

    it('should return data in expected format', async () => {
      const res = await fetchBezwaren(requestId, profileAndToken);

      expect(bezwarenApiResponse.count).toEqual(res.content?.length);

      expect(res).toMatchSnapshot();
    });

    it('should return the right notifications', async () => {
      const res = await fetchBezwarenNotifications(requestId, profileAndToken);

      expect(res).toMatchInlineSnapshot(`
        {
          "content": {
            "notifications": [
              {
                "chapter": "BEZWAREN",
                "datePublished": "2021-05-01",
                "description": "Wij hebben uw bezwaar BI.21.014121.001 ontvangen.",
                "id": "BI.21.014121.001",
                "link": {
                  "title": "Bekijk uw bezwaar",
                  "to": "/bezwaren/68cdd171-b4fd-44cc-a4d3-06b77341f20a",
                },
                "title": "Bezwaar ontvangen",
              },
              {
                "chapter": "BEZWAREN",
                "datePublished": "2021-05-01",
                "description": "Wij hebben uw bezwaar JB.22.000076.001 in behandeling genomen.",
                "id": "JB.22.000076.001",
                "link": {
                  "title": "Bekijk uw bezwaar",
                  "to": "/bezwaren/9804b064-90a3-43b0-bc7c-924f9939888d",
                },
                "title": "Bezwaar in behandeling",
              },
              {
                "chapter": "BEZWAREN",
                "datePublished": "2021-05-01",
                "description": "Wij hebben uw bezwaar ZAAK2 ontvangen.",
                "id": "ZAAK2",
                "link": {
                  "title": "Bekijk uw bezwaar",
                  "to": "/bezwaren/cc117d91-1b00-4bae-bbdd-9ea3a6d6d185",
                },
                "title": "Bezwaar ontvangen",
              },
              {
                "chapter": "BEZWAREN",
                "datePublished": "2023-08-23",
                "description": "Wij hebben uw bezwaar ZAAK3 afgehandeld.",
                "id": "ZAAK3",
                "link": {
                  "title": "Bekijk uw bezwaar",
                  "to": "/bezwaren/956541b6-7a25-4132-9592-0a509bc7ace0",
                },
                "title": "Bezwaar afgehandeld",
              },
            ],
          },
          "status": "OK",
        }
      `);
    });

    it('should be possible to download a document', async () => {
      remoteApi
        .get(
          `/bezwaren/zgw/v1/enkelvoudiginformatieobjecten/${documentId}/download`
        )
        .reply(200);

      const documentResponse = await fetchBezwaarDocument(
        requestId,
        profileAndToken,
        documentIdEncrypted,
        true
      );

      expect(documentResponse.status).toEqual(200);
    });
  });

  describe('fetch multiple pages of bezwaren', () => {
    describe('empty response', () => {
      const emptyResponse = {
        count: 0,
        results: null,
      };

      beforeEach(() => {
        remoteApi
          .post(`${endpointBase}/_zoek?page=1`)
          .reply(200, emptyResponse);
      });

      it('should fetch only once', async () => {
        const res = await fetchBezwaren(requestId, profileAndToken);

        expect(res.status).toEqual('OK');
        expect(res.content?.length).toEqual(0);
      });
    });

    describe('regular flow', () => {
      beforeEach(() => {
        remoteApi
          .post(`${endpointBase}/_zoek?page=1`)
          .reply(200, {
            ...bezwarenApiResponse,
            count: 8,
          })
          .post(`${endpointBase}/_zoek?page=2`)
          .reply(200, {
            ...bezwarenApiResponse,
            count: 8,
          })
          .get((uri) => uri.includes('/enkelvoudiginformatieobjecten'))
          .times(8)
          .reply(200, bezwarenDocumenten)
          .get((uri) => uri.includes('/statussen'))
          .times(8)
          .reply(200, bezwarenStatus);
      });

      it('should fetch more results', async () => {
        const res = await fetchBezwaren(requestId, profileAndToken);

        expect(res.status).toEqual('OK');
        expect(res.content?.length).toEqual(8);
      });
    });
  });
});
