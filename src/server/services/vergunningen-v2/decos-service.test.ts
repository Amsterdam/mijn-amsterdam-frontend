import { remoteApi } from '../../../test-utils';
import { forTesting as decos } from './decos-service';
import { getAuthProfile } from '../../helpers/app';
import nock from 'nock';

describe('decos-service api test', () => {
  beforeEach(() => {
    // RP TODO: Nock adds port :80 after origin, other tests also have this problem
    // If unless that's not a problem?
    remoteApi
      .post('/decos/search/books?properties=false&select=key')
      .reply(200, {});
    console.log(nock.activeMocks());
  });

  describe('getUserKey tests', () => {
    test('Regular happy path', async () => {
      const profile = getAuthProfile({
        authMethod: 'digid',
        profileType: 'commercial',
        aud: 'test1',
        sid: 'test5',
        sub: '',
      });
      const authProfileAndToken = { profile, token: '111222333' };
      const requestID = '456';
      const userKeys = await decos.getUserKeys(requestID, authProfileAndToken);

      // RP TODO: Still have to determine a good response after fixing nock problem
      expect(userKeys).toEqual(['somekey']);
    });
  });
});
