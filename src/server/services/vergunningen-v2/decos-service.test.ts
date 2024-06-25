import { remoteApi } from '../../../test-utils';
import { forTesting, fetchDecosDocument } from './decos-service';
import { AuthProfileAndToken, getAuthProfile } from '../../helpers/app';
import nock from 'nock';

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
  const reqID: requestID = '456';

  describe('getUserKey', () => {
    it('Fetches user keys', async () => {
      remoteApi
        .post('/decos/search/books?properties=false&select=key')
        .reply(200, {
          itemDataResultSet: {
            content: ['A', 'B', 'C'],
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
            content: ['D', 'E', 'F'],
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
      remoteApi.get('/items/:docId/content').reply(200, {});
      const doc = await fetchDecosDocument('456', '123456789');
      expect(doc).toBe('jjj');
    });
  });
});
