import { describe } from 'vitest';

import {
  getAuthProfileAndToken,
  RequestMock,
  ResponseAuthenticatedMock,
  remoteApi,
  TEST_SESSION_ID,
} from '../../../testing/utils.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import {
  decrypt,
  encryptPayloadAndSessionID,
} from '../../helpers/encrypt-decrypt.ts';
import { fetchAfisAccounts, fetchIsKnownInAFIS } from './afis.ts';
import { formatBusinessPartnerId } from './afis-helpers.ts';
import { handleAfisRequestWithEncryptedPayloadQueryParam } from './afis-route-handlers.ts';

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
        facturen: null,
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

      expect(response).toMatchObject(TRANSFORMED_RESPONSES.isKnown);
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

      expect(response).toMatchObject(TRANSFORMED_RESPONSES.isKnown);
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
          "facturen": null,
          "isKnown": false,
        }
      `);
      expect(response.status).toBe('OK');
    });

    it('loads all eligible account options and immediately selects the general account without KvK', async () => {
      remoteApi.post(ROUTES.businesspartnerKVK).reply(200, {
        Record: [
          {
            KVK: 11111111,
            Zakenpartnernummer: '113',
            Vestigingsnummer: '000021946485',
            Gevonden: 'Ja',
            Blokkade: 'Nee',
          },
          {
            KVK: 11111111,
            Zakenpartnernummer: '96',
            Gevonden: 'Ja',
            Blokkade: 'Nee',
          },
          {
            KVK: 11111111,
            Zakenpartnernummer: '999',
            Gevonden: 'Ja',
            Blokkade: 'Ja',
          },
          {
            KVK: 11111111,
            Zakenpartnernummer: '998',
            Gevonden: 'Nee',
            Blokkade: 'Nee',
          },
        ],
      });
      remoteApi
        .get((uri) => uri.includes('A_BusinessPartner?'))
        .times(2)
        .reply(200, {
          feed: {
            entry: [
              {
                content: {
                  properties: { BusinessPartnerFullName: 'Mijn bedrijf' },
                },
              },
            ],
          },
        });
      remoteApi.get(ROUTES.facturen).times(9).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        getAuthProfileAndToken('commercial')
      );

      expect(response.status).toBe('OK');
      expect(response.content?.accounts).toHaveLength(2);
      expect(
        response.content?.accounts?.map((account) => account.vestigingsnummer)
      ).toEqual(['000021946485', null]);
      expect(response.content?.accounts?.[0].name).toBe('Mijn bedrijf');
      expect(response.content?.businessPartnerIdEncrypted).toBe(
        response.content?.accounts?.[1].businessPartnerIdEncrypted
      );
      expect(response.content).not.toHaveProperty('businessPartnerId');
      expect(response.content?.accounts?.[0]).not.toHaveProperty(
        'businessPartnerId'
      );
    });

    it('sends and enforces the token restriction when resolving accounts', async () => {
      const auth = getAuthProfileAndToken('commercial');
      auth.profile.vestigingsnummer = '000038509490';
      remoteApi
        .post(ROUTES.businesspartnerKVK, {
          KVK: auth.profile.id,
          Vestigingsnummer: '000038509490',
        })
        .reply(200, {
          Record: [
            {
              KVK: auth.profile.id,
              Zakenpartnernummer: '96',
              Gevonden: 'Ja',
              Blokkade: 'Nee',
            },
            {
              KVK: auth.profile.id,
              Zakenpartnernummer: '113',
              Vestigingsnummer: '000038509490',
              Gevonden: 'Ja',
              Blokkade: 'Nee',
            },
          ],
        });

      const response = await fetchAfisAccounts(auth);

      expect(response.status).toBe('OK');
      expect(response.content).toHaveLength(1);
      expect(response.content?.[0]).toMatchObject({
        vestigingsnummer: '000038509490',
        businessPartnerId: formatBusinessPartnerId('113'),
      });
    });

    it.each([undefined, ''])(
      'omits an absent or empty restriction (%s)',
      async (vestigingsnummer) => {
        const auth = getAuthProfileAndToken('commercial');
        auth.profile.vestigingsnummer = vestigingsnummer;
        remoteApi
          .post(ROUTES.businesspartnerKVK, { KVK: auth.profile.id })
          .reply(200, RESPONSE_BODIES.KVKFound);

        const response = await fetchAfisAccounts(auth);

        expect(response.status).toBe('OK');
        expect(response.content).toHaveLength(1);
      }
    );
  });
});

describe('AFIS account authorization', () => {
  it.each([
    ['113', true],
    ['96', false],
  ] as const)(
    'authorizes account %s: %s',
    async (businessPartnerId, isAllowed) => {
      const auth = getAuthProfileAndToken('commercial');
      auth.profile = {
        ...auth.profile,
        authMethod: 'eherkenning',
        profileType: 'commercial',
        vestigingsnummer: '000038509490',
      };
      remoteApi.post(ROUTES.businesspartnerKVK).reply(200, {
        Record: {
          KVK: auth.profile.id,
          Zakenpartnernummer: '113',
          Vestigingsnummer: '000038509490',
          Blokkade: 'Nee',
          Gevonden: 'Ja',
        },
      });
      const service = vi.fn().mockResolvedValue(apiSuccessResult(true));
      const handler = handleAfisRequestWithEncryptedPayloadQueryParam(service);
      const req = RequestMock.new().setQuery({
        payload: encryptPayloadAndSessionID(auth.profile.sid, {
          businessPartnerId: formatBusinessPartnerId(businessPartnerId),
        }),
      });
      const res = ResponseAuthenticatedMock.new();
      res.locals.authProfileAndToken = auth;

      await handler(req, res);

      expect(service).toHaveBeenCalledTimes(isAllowed ? 1 : 0);
      if (!isAllowed) {
        expect(res.status).toHaveBeenCalledWith(403);
      }
    }
  );
});
