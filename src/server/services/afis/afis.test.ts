import { describe } from 'vitest';

import { fetchIsKnownInAFIS } from './afis';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';

const mocks = vi.hoisted(() => {
  const MOCK_VALUE_ENCRYPTED = 'xx-encrypted-xx';
  const MOCK_VALUE_DECRYPTED = 'value-decrypted';

  return {
    MOCK_VALUE_ENCRYPTED,
    MOCK_VALUE_DECRYPTED,
  };
});

vi.mock('../../../server/helpers/encrypt-decrypt', async (importOriginal) => {
  const original: object = await importOriginal();
  return {
    ...original,
    encryptSessionIdWithRouteIdParam: vi
      .fn()
      .mockReturnValue(mocks.MOCK_VALUE_ENCRYPTED),
    decrypt: vi.fn().mockReturnValue(mocks.MOCK_VALUE_DECRYPTED),
  };
});

const BASE_ROUTE = '/afis/RESTAdapter';

const ROUTES = {
  businesspartnerBSN: `${BASE_ROUTE}/businesspartner/BSN/`,
  businesspartnerKVK: `${BASE_ROUTE}/businesspartner/KVK/`,
  facturen: (uri: string) => {
    const isFacturenEndpointMatch = uri.includes(`IsCleared+eq`);
    return isFacturenEndpointMatch;
  },
};

const RESPONSE_BODIES = {
  BSNFound: {
    BSN: 111111111,
    Zakenpartnernummer: '4444444444',
    Blokkade: 'Nee',
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
  KVKNotFound: {
    Record: {
      KVK: 12345678,
      Vestigingsnummer: '000038509490',
      Gevonden: 'Nee',
    },
  },
  KVKNotFoundVestigingen: {
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

describe('fetchIsKnownInAFIS ', () => {
  const TRANSFORMED_RESPONSES = {
    isKnown: {
      content: {
        businessPartnerIdEncrypted: mocks.MOCK_VALUE_ENCRYPTED,
        facturen: {
          afgehandeld: {
            count: 0,
            facturen: [],
          },
          open: {
            count: 0,
            facturen: [],
          },
          overgedragen: {
            count: 0,
            facturen: [],
          },
        },
        isKnown: true,
      },
      status: 'OK',
    },
    isNotKnown: {
      content: {
        businessPartnerIdEncrypted: null,
        isKnown: false,
      },
      status: 'OK',
    },
  };

  describe('FetchIsKnownInAfis', async () => {
    it('Does a request with BSN and transforms the response', async () => {
      remoteApi
        .post(ROUTES.businesspartnerBSN)
        .reply(200, RESPONSE_BODIES.BSNFound);
      remoteApi.get(ROUTES.facturen).times(8).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('private')
      );

      expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isKnown);
    });

    it("Transforms response to '{isKnown: false }' when BSN is not found", async () => {
      remoteApi.post(ROUTES.businesspartnerBSN).reply(200, {
        BSN: 123456789,
        Gevonden: 'Nee',
      });
      remoteApi.get(ROUTES.facturen).times(4).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('private')
      );

      expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isNotKnown);
    });

    it('Does a request with KVK and transforms the output', async () => {
      remoteApi
        .post(ROUTES.businesspartnerKVK)
        .reply(200, RESPONSE_BODIES.KVKFound);
      remoteApi.get(ROUTES.facturen).times(8).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('commercial')
      );

      expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isKnown);
    });

    it("Transforms response to '{isKnown: false }' when KVK is not found", async () => {
      remoteApi
        .post(ROUTES.businesspartnerKVK)
        .reply(200, RESPONSE_BODIES.KVKNotFound);
      remoteApi.get(ROUTES.facturen).times(4).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('commercial')
      );

      expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isNotKnown);
    });

    it('Handles a bad request by returning an AxiosError', async () => {
      remoteApi.post(ROUTES.businesspartnerBSN).reply(400, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('private')
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "code": 400,
          "content": null,
          "message": "Request failed with status code 400",
          "status": "ERROR",
        }
      `);
    });

    it('Handles server error as expected', async () => {
      remoteApi
        .post(ROUTES.businesspartnerBSN)
        .replyWithError('error retrieving doc');

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('private')
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "content": null,
          "message": "error retrieving doc",
          "status": "ERROR",
        }
      `);
    });

    it('Handles getting just null as a response by returning an AxiosError', async () => {
      remoteApi.post(ROUTES.businesspartnerBSN).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('private')
      );

      expect(response.content).toMatchInlineSnapshot(`
        {
          "businessPartnerIdEncrypted": null,
          "isKnown": false,
        }
      `);
      expect(response.status).toBe('OK');
    });
  });
});
