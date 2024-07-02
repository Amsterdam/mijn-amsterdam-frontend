import { fetchAFISBearerToken, fetchAFISBusinessPartner } from './afis';
import * as test from '../../../test-utils';

const REQUEST_ID = '456';

describe('fetchBearerToken tests', () => {
  it('Filters out the access token', async () => {
    const access_token = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

    test.remoteApi.post('/afis/RESTAdapter/OAuthServer').reply(200, {
      access_token,
      token_type: 'bearer',
      expires_in: 3600,
    });

    const bearerToken = await fetchAFISBearerToken(
      REQUEST_ID,
      test.authProfileAndToken('private')
    );

    expect(bearerToken).toStrictEqual({
      content: access_token,
      status: 'OK',
    });
  });
});

describe('isBusinessPartner tests', () => {
  const RESPONSE_BODIES = {
    BSNFound: {
      BSN: 111111111,
      Zakenpartnernummer: '3333333333',
      Blokkade: 'Nee',
      Afnemers_indicatie: 'Nee',
      Gevonden: 'Ja',
    },
    KVKFound: {
      Record: {
        KVK: 22222222,
        Zakenpartnernummer: '4444444444',
        Blokkade: 'Nee',
        Gevonden: 'Ja',
      },
    },
  };

  const RESPONSES = {
    isKnown: {
      content: { isKnown: true },
      status: 'OK',
    },
  };

  it('Does a request with BSN', async () => {
    test.remoteApi
      .post('/afis/RESTAdapter/businesspartner/BSN')
      .reply(200, RESPONSE_BODIES.BSNFound);

    const response = await fetchAFISBusinessPartner(
      REQUEST_ID,
      test.authProfileAndToken('private')
    );

    expect(response).toStrictEqual(RESPONSES.isKnown);
  });

  it('Does a request with KVK', async () => {
    test.remoteApi
      .post('/afis/RESTAdapter/businesspartner/KVK')
      .reply(200, RESPONSE_BODIES.KVKFound);

    const response = await fetchAFISBusinessPartner(
      REQUEST_ID,
      test.authProfileAndToken('commercial')
    );

    expect(response).toStrictEqual(RESPONSES.isKnown);
  });

  it('It returns an error code');
  // RP TODO: Zelfde als fetchtoken
});

// RP TODO:
// - Nieuwe icon bij Bram vragen, kan niet dat het hetzelfde icon is als belastingen (stuur screenshot)
//
// - Null met 200 OK door API teruggeven
// - Error 500 code
// - Verchillende bodies, Record array of 1 object
// -
// remoteApi.post('/zorgned/persoonsgegevensNAW').reply(500, new Error('HARDE FAIL OUWE'));
//
// Later naar Test server deployen met Tim
