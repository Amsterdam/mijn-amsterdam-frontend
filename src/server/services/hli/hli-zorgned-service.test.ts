import { remoteApi } from '../../../test-utils';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchClientNummer, forTesting } from './hli-zorgned-service';
import { ZorgnedPersoonsgegevensNAWResponse } from './regelingen-types';

describe('hli-zorgned-service', () => {
  const authProfileAndToken: AuthProfileAndToken = {
    profile: {
      id: '123456789',
      sid: 'xxxxxx-sid-xxxxxx',
      profileType: 'private',
      authMethod: 'digid',
    },
    token: '',
  };

  test('volledigClientnummer', () => {
    const nr = forTesting.volledigClientnummer(1234567);
    expect(nr).toMatchInlineSnapshot();

    const nr2 = forTesting.volledigClientnummer(8888888888);
    expect(nr2).toMatchInlineSnapshot();
  });

  test('transformZorgnedClientNummerResponse', () => {
    const response = forTesting.transformZorgnedClientNummerResponse({
      persoon: {
        clientidentificatie: 567890,
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    expect(response).toMatchInlineSnapshot();

    const response2 = forTesting.transformZorgnedClientNummerResponse(
      {} as ZorgnedPersoonsgegevensNAWResponse
    );

    expect(response).toBe(null);
  });

  test('fetchClientNummer success', async () => {
    remoteApi.post('/persoonsgegevensNAW').reply(200, {
      persoon: {
        clientidentificatie: 567890,
      },
    } as ZorgnedPersoonsgegevensNAWResponse);

    const response = await fetchClientNummer('xxxx', authProfileAndToken);

    expect(response).toMatchInlineSnapshot();
  });

  test('fetchClientNummer fail', async () => {
    remoteApi.post('/persoonsgegevensNAW').reply(500);

    const response = await fetchClientNummer('xxxx', authProfileAndToken);

    expect(response).toMatchInlineSnapshot();
  });

  test('transformZorgnedBetrokkeneNaamResponse', () => {});
  test('fetchNamenBetrokkenen', () => {});
  test('assignIsActueel', () => {});
  test('fetchZorgnedAanvragenHLI', () => {});
});
