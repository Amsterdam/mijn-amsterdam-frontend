import { describe } from 'vitest';

import { formatBusinessPartnerId } from './afis-helpers.ts';
import { fetchIsKnownInAFIS } from './afis.ts';
import {
  getAuthProfileAndToken,
  remoteApi,
  TEST_SESSION_ID,
} from '../../../testing/utils.ts';
import { featureToggle } from '../../config/feature-toggles.ts';
import { decrypt } from '../../helpers/encrypt-decrypt.ts';

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
    Zakenpartnernummer: '67899',
    Blokkade: 'Nee',
    Gevonden: 'Ja',
  },
  KVKFound: {
    Record: {
      KVK: 22222222,
      Zakenpartnernummer: '67899',
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
  const MULTIPLE_VESTIGINGEN_TOGGLE =
    'AFIS.blockDataForMultipleKvKVestigingen' as const;
  const ORIGINAL_MULTIPLE_VESTIGINGEN_TOGGLE_VALUE =
    featureToggle[MULTIPLE_VESTIGINGEN_TOGGLE];

  afterEach(() => {
    featureToggle[MULTIPLE_VESTIGINGEN_TOGGLE] =
      ORIGINAL_MULTIPLE_VESTIGINGEN_TOGGLE_VALUE;
  });

  const TRANSFORMED_RESPONSES = {
    isKnown: {
      content: {
        businessPartnerIdEncrypted: expect.any(String),
        facturen: {
          afgehandeld: {
            count: 0,
            facturen: [],
            state: 'afgehandeld',
          },
          open: {
            count: 0,
            facturen: [],
            state: 'open',
          },
          overgedragen: {
            count: 0,
            facturen: [],
            state: 'overgedragen',
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
      remoteApi.get(ROUTES.facturen).times(9).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('private')
      );
      const businessPartnerIdFormatted = formatBusinessPartnerId(
        RESPONSE_BODIES.BSNFound.Zakenpartnernummer
      );

      expect(decrypt(response.content?.businessPartnerIdEncrypted ?? '')).toBe(
        `{"sessionID":"${TEST_SESSION_ID}","payload":{"businessPartnerId":"${businessPartnerIdFormatted}"}}`
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
      remoteApi.get(/\/vestigingen/).reply(200, {
        _embedded: {
          vestigingen: [{}],
        },
      });
      remoteApi.get(ROUTES.facturen).times(9).reply(200, {});

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

      expect(response).toMatchObject({
        code: 400,
        content: null,
        status: 'ERROR',
      });
    });

    it('Handles server error as expected', async () => {
      remoteApi
        .post(ROUTES.businesspartnerBSN)
        .replyWithError('error retrieving doc');

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('private')
      );

      expect(response).toMatchObject({
        code: 500,
        content: null,
        status: 'ERROR',
      });
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

    it('sets showMultipleVestigingenDisclaimer true and businessPartnerIdEncrypted null when toggle is enabled and profile is KVK', async () => {
      featureToggle[MULTIPLE_VESTIGINGEN_TOGGLE] = true;

      remoteApi
        .post(ROUTES.businesspartnerKVK)
        .reply(200, RESPONSE_BODIES.KVKFound);
      remoteApi.get(/\/vestigingen/).reply(200, {
        _embedded: {
          vestigingen: [{ vestigingsnummer: '111111111111' }, {}],
        },
      });

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('commercial')
      );

      expect(response.status).toBe('OK');
      expect(response.content?.showMultipleVestigingenDisclaimer).toBe(true);
      expect(response.content?.businessPartnerIdEncrypted).toBeNull();
    });

    it('does not set showMultipleVestigingenDisclaimer when toggle is disabled', async () => {
      featureToggle[MULTIPLE_VESTIGINGEN_TOGGLE] = false;

      remoteApi
        .post(ROUTES.businesspartnerKVK)
        .reply(200, RESPONSE_BODIES.KVKFound);
      remoteApi.get(ROUTES.facturen).times(9).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('commercial')
      );

      expect(response.status).toBe('OK');
      expect(response.content?.showMultipleVestigingenDisclaimer).not.toBe(
        true
      );
      expect(response.content?.businessPartnerIdEncrypted).toEqual(
        expect.any(String)
      );
    });

    it('does not set showMultipleVestigingenDisclaimer for non-KVK profile when toggle is enabled', async () => {
      featureToggle[MULTIPLE_VESTIGINGEN_TOGGLE] = true;

      remoteApi
        .post(ROUTES.businesspartnerBSN)
        .reply(200, RESPONSE_BODIES.BSNFound);
      remoteApi.get(ROUTES.facturen).times(9).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('private')
      );

      expect(response.status).toBe('OK');
      expect(response.content?.showMultipleVestigingenDisclaimer).not.toBe(
        true
      );
      expect(response.content?.businessPartnerIdEncrypted).toEqual(
        expect.any(String)
      );
    });
  });
});
