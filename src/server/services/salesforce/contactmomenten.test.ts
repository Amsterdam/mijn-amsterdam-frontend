import { fetchContactmomenten } from './contactmomenten';
import contactmomenten from '../../../../mocks/fixtures/salesforce-contactmomenten.json';
import { remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';

describe('Salesforce service', () => {
  const profileAndToken: AuthProfileAndToken = {
    profile: {
      id: '123',
      authMethod: 'digid',
      profileType: 'private',
      sid: '',
    },
    token: 'abc123',
  };

  describe('salesforce-contactmomenten.service', () => {
    beforeEach(() => {
      remoteApi.get(`/salesforce`).reply(200, contactmomenten);
    });

    it('should transform the data correctly', async () => {
      const requestID = '123';

      // remoteApi.get(/\/salesforce/).reply((uri) => {
      //   console.log('uri', uri);
      //   if (uri.includes('contactmomenten/services')) {
      //     return [200, contactmomenten];
      //   }
      //   return [200, null];
      // });
      const result = await fetchContactmomenten(requestID, profileAndToken);
      // expect(result.status).toBe('OK');
    });
  });
});
