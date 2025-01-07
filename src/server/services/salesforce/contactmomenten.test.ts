import { fetchContactmomenten } from './contactmomenten';
import { remoteApi } from '../../../testing/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';

const responseData = {
  results: [
    {
      plaatsgevondenOp: '2024-05-22 08:28:45',
      onderwerp: 'Algemeen',
      nummer: '10001875',
      kanaal: 'Telefoon',
    },
    {
      plaatsgevondenOp: '2024-05-29 08:02:38',
      onderwerp: 'Meldingen',
      nummer: '00002032',
      kanaal: 'Telefoon',
    },
  ],
};

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
      remoteApi
        .get(
          '/KLANT_CONTACT/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/?hadBetrokkene__uuid=123'
        )
        .reply(200, responseData);
    });

    it('should transform the data correctly', async () => {
      const requestID = '123';

      const result = await fetchContactmomenten(requestID, profileAndToken);
      expect(result.status).toBe('OK');
      expect(result.content![0].kanaal).toEqual('Telefoon'); // results is removed from the response
    });
  });
});
