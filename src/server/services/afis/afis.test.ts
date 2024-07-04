import { fetchAFISBearerToken, fetchIsKnownInAFIS } from './afis';
import { remoteApi, authProfileAndToken } from '../../../test-utils';
import { AxiosError } from 'axios';

const BASE_ROUTE = '/afis/RESTAdapter';
const ROUTES = {
  OAUTH: `${BASE_ROUTE}/OAuthServer`,
  businesspartnerBSN: `${BASE_ROUTE}/businesspartner/BSN/`,
  businesspartnerKVK: `${BASE_ROUTE}/businesspartner/KVK/`,
};
const REQUEST_ID = '456';
const access_token = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

describe('fetchBearerToken tests', () => {
  it('Filters out the access token', async () => {
    remoteApi.post(ROUTES.OAUTH).reply(200, {
      access_token,
      token_type: 'bearer',
      expires_in: 3600,
    });
    const bearerToken = await fetchAFISBearerToken(
      REQUEST_ID,
      authProfileAndToken('private')
    );

    expect(bearerToken).toStrictEqual({
      content: `bearer ${access_token}`,
      status: 'OK',
    });
  });
});

describe('fetchIsKnownInAFIS ', () => {
  beforeEach(() => {
    remoteApi.post(ROUTES.OAUTH).reply(200, {
      access_token,
      token_type: 'bearer',
      expires_in: 3600,
    });
  });

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
    MultipleVestigingenKVK: {
      Record: [
        {
          KVK: 11111111,
          Zakenpartnernummer: '2222222222',
          Blokkade: 'Nee',
          Gevonden: 'Ja',
        },
        {
          KVK: 11111111,
          Vestigingsnummer: '333333333333',
          Zakenpartnernummer: '8888888888',
          Blokkade: 'Nee',
          Gevonden: 'Ja',
        },
      ],
    },
  };

  const TRANSFORMED_RESPONSES = {
    isKnown: {
      content: { isKnown: true },
      status: 'OK',
    },
    isNotKnown: {
      content: { isKnown: false },
      status: 'OK',
    },
  };

  describe('BSN Businesspartner ', async () => {
    it('Does a request with BSN and transforms the response', async () => {
      remoteApi
        .post(ROUTES.businesspartnerBSN)
        .reply(200, RESPONSE_BODIES.BSNFound);

      const response = await fetchIsKnownInAFIS(
        REQUEST_ID,
        authProfileAndToken('private')
      );

      expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isKnown);
    });

    it("Transforms response to '{isKnown: false }' when BSN is not found", async () => {
      remoteApi.post(ROUTES.businesspartnerBSN).reply(200, {
        BSN: 123456789,
        Gevonden: 'Nee',
      });

      const response = await fetchIsKnownInAFIS(
        REQUEST_ID,
        authProfileAndToken('private')
      );

      expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isNotKnown);
    });
  });

  describe('KVK Businesspartner ', async () => {
    it('Does a request with KVK and transforms the output', async () => {
      remoteApi
        .post(ROUTES.businesspartnerKVK)
        .reply(200, RESPONSE_BODIES.KVKFound);

      const response = await fetchIsKnownInAFIS(
        REQUEST_ID,
        authProfileAndToken('commercial')
      );

      expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isKnown);
    });

    it("Transforms response to '{isKnown: false }' when KVK is not found", async () => {
      remoteApi.post(ROUTES.businesspartnerKVK).reply(200, {
        Record: {
          KVK: 12345678,
          Vestigingsnummer: '000038509490',
          Gevonden: 'Nee',
        },
      });

      const response = await fetchIsKnownInAFIS(
        REQUEST_ID,
        authProfileAndToken('commercial')
      );

      expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isNotKnown);
    });

    it('Handles a response with multiple vestigingen', async () => {
      remoteApi.post(ROUTES.businesspartnerKVK).reply(200, {
        Record: [
          {
            KVK: 11111111,
            Zakenpartnernummer: '9999999999',
            Blokkade: 'Nee',
            Gevonden: 'Ja',
          },
          {
            KVK: 11111111,
            Vestigingsnummer: '555555555555',
            Zakenpartnernummer: '8888888888',
            Blokkade: 'Nee',
            Gevonden: 'Ja',
          },
        ],
      });

      const response = await fetchIsKnownInAFIS(
        REQUEST_ID,
        authProfileAndToken('commercial')
      );

      expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isKnown);
    });
  });

  describe('Error behavior ', () => {
    it('Handles a bad request by returning an AxiosError', async () => {
      remoteApi.post(ROUTES.businesspartnerBSN).reply(400, {
        error: {
          code: '400',
          message: '', // Empty, because not important
          logID: 'AAAAAAAAAAAA22222222222222222222',
        },
      });
      const response = await fetchIsKnownInAFIS(
        REQUEST_ID,
        authProfileAndToken('private')
      );

      expect(response).toMatchInlineSnapshot(`
      {
        "code": "400",
        "content": null,
        "message": "AxiosError: Request failed with status code 400 {"isKnown":false}",
        "status": "ERROR",
      }
    `);
    });

    it('Handles server error as expected', async () => {
      const err = new AxiosError('error retrieving doc', '500');

      remoteApi.post(ROUTES.businesspartnerBSN).replyWithError(err);
      const response = await fetchIsKnownInAFIS(
        REQUEST_ID,
        authProfileAndToken('private')
      );

      expect(response).toMatchInlineSnapshot(`
      {
        "content": null,
        "message": "AxiosError: error retrieving doc",
        "status": "ERROR",
      }
    `);
    });
  });

  it('Handles getting just null as a response by returning an AxiosError', async () => {
    remoteApi.post(ROUTES.businesspartnerBSN).reply(200, 'null');
    const response = await fetchIsKnownInAFIS(
      REQUEST_ID,
      authProfileAndToken('private')
    );

    expect(response.content).toBe(null);
    expect(response.status).toBe('OK');
  });
});
