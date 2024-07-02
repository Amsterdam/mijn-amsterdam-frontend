import { AxiosError, AxiosResponse } from 'axios';
import { remoteApi } from '../../../test-utils';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchDecosDocument, forTesting } from './decos-service';

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
  const reqID: requestID = '456-ABC';

  describe('getUserKey', () => {
    it('Fetches user keys', async () => {
      remoteApi
        .post('/decos/search/books?properties=false&select=key')
        .reply(200, {
          itemDataResultSet: {
            content: [{ key: 'A' }, { key: 'B' }, { key: 'C' }],
          },
        })
        .post('/decos/search/books?properties=false&select=key')
        .reply(200, {
          itemDataResultSet: {
            content: [],
          },
        })
        .post('/decos/search/books?properties=false&select=key')
        .reply(200, {
          itemDataResultSet: {
            content: [{ key: 'D' }, { key: 'E' }, { key: 'F' }],
          },
        })
        .post('/decos/search/books?properties=false&select=key')
        .reply(500);

      const userKeys = await forTesting.getUserKeys(reqID, authProfileAndToken);

      expect(userKeys).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    });
  });

  describe('fetchDecosDocument', () => {
    test('fetches a document', async () => {
      remoteApi.get('/decos/items/123456789/content').reply(200, 'xx');
      const response = await fetchDecosDocument('456', '123456789');

      expect((response as AxiosResponse).config.responseType).toBe('stream');
    });
    test('fails to fetch a document', async () => {
      const err = new AxiosError('error retrieving doc', '500');
      remoteApi.get('/decos/items/123456789/content').replyWithError(err);

      const response = await fetchDecosDocument('456', '123456789');

      expect(response).toMatchInlineSnapshot(`
        {
          "code": "500",
          "content": null,
          "message": "error retrieving doc",
          "status": "ERROR",
        }
      `);
    });
  });

  describe('fetchDecosVergunningenSource', async () => {});

  describe('fetchDecosWorkflowDate', async () => {});

  describe('fetchDecosDocumentList', async () => {});

  describe('fetchDecosVergunning', async () => {});

  describe('fetchDecosDocument', async () => {});
});
