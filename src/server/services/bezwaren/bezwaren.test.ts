import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import bezwarenDocumenten from '../../../../mocks/fixtures/bezwaren-documents.json';
import bezwarenStatus from '../../../../mocks/fixtures/bezwaren-status.json';
import bezwarenApiResponse from '../../../../mocks/fixtures/bezwaren.json';
import { remoteApiHost } from '../../../setupTests';
import { remoteApi } from '../../../test-utils';
import { range } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchBezwaarDetail,
  fetchBezwaarDocument,
  fetchBezwaren,
  fetchBezwarenNotifications,
  forTesting,
} from './bezwaren';

const endpointBase = '/bezwaren/zgw/v1/zaken';

vi.mock('../../../server/helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encryptSessionIdWithRouteIdParam: vi
      .fn()
      .mockReturnValue('test-encrypted-id'),
    decrypt: () => 'session-id:e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
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
      sid: 'session-id',
    },
    token: 'abc123',
  };

  afterEach(() => {
    vi.clearAllMocks();

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-08-24'));
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

    it('should return the right recent notifications', async () => {
      const res = await fetchBezwarenNotifications(requestId, profileAndToken);

      expect(res).toMatchInlineSnapshot(`
        {
          "content": {
            "notifications": [
              {
                "datePublished": "2023-08-23",
                "description": "Wij hebben uw bezwaar JB.22.000443.002 afgehandeld.",
                "id": "JB.22.000443.002",
                "link": {
                  "title": "Bekijk uw bezwaar",
                  "to": "/bezwaren/956541b6-7a25-4132-9592-0a509bc7ace0",
                },
                "thema": "BEZWAREN",
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
        documentIdEncrypted
      );

      expect(documentResponse.status).toEqual('OK');
    });
  });

  describe('fetch multiple pages of bezwaren', () => {
    it('should fetch only once', async () => {
      const emptyResponse = {
        count: 0,
        results: null,
      };

      remoteApi.post(`${endpointBase}/_zoek?page=1`).reply(200, emptyResponse);
      const res = await fetchBezwaren(requestId, profileAndToken);

      expect(res.status).toEqual('OK');
      expect(res.content?.length).toEqual(0);
    });

    test('fetchMultiple success', async () => {
      remoteApi
        .post(`${endpointBase}/_zoek?page=1`)
        .reply(200, { count: 75, items: range(1, 20) })
        .post(`${endpointBase}/_zoek?page=2`)
        .reply(200, { count: 75, items: range(21, 40) })
        .post(`${endpointBase}/_zoek?page=3`)
        .reply(200, { count: 75, items: range(41, 60) })
        .post(`${endpointBase}/_zoek?page=4`)
        .reply(200, { count: 75, items: range(61, 75) });

      const response = await forTesting.fetchMultiple('xx', {
        url: `${remoteApiHost}${endpointBase}/_zoek`,
        method: 'post',
        params: {
          page: 1,
        },
      });

      expect(response.content?.[0]).toBe(1);
      expect(response.content?.[74]).toBe(75);
    });

    test('fetchMultiple error', async () => {
      remoteApi
        .post(`${endpointBase}/_zoek?page=1`)
        .reply(200, { count: 75, items: range(1, 20) })
        .post(`${endpointBase}/_zoek?page=2`)
        .reply(500, undefined);

      const response = await forTesting.fetchMultiple('xx', {
        url: `${remoteApiHost}${endpointBase}/_zoek`,
        method: 'post',
        params: {
          page: 1,
        },
      });

      expect(response.status).toBe('ERROR');
      expect(response.content).toBe(null);
    });

    it('should fetch more results', async () => {
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
        });
      const res = await fetchBezwaren(requestId, profileAndToken);

      expect(res.status).toEqual('OK');
      expect(res.content?.length).toEqual(8);
    });

    it('should fetch more results', async () => {
      remoteApi
        .get((uri) => uri.includes('/enkelvoudiginformatieobjecten'))
        .times(1)
        .reply(200, bezwarenDocumenten)
        .get((uri) => uri.includes('/statussen'))
        .times(1)
        .reply(200, bezwarenStatus);

      const res = await fetchBezwaarDetail(requestId, profileAndToken, 'xxx');

      expect(res.status).toEqual('OK');
      expect(res.content?.statussen?.length).toBeGreaterThan(0);
      expect(res.content?.documents?.length).toBeGreaterThan(0);
    });

    it('should fail to fetch more results', async () => {
      const res = await fetchBezwaarDetail(
        requestId,
        {
          ...profileAndToken,
          profile: { ...profileAndToken.profile, sid: 'nope' },
        },
        'xxx'
      );

      expect(res).toMatchInlineSnapshot(`
        {
          "code": 401,
          "content": null,
          "message": "Not authorized: incomplete session validation",
          "status": "ERROR",
        }
      `);
    });
  });
});
