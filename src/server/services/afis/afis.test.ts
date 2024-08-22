import { describe } from 'vitest';
import { remoteApi } from '../../../test-utils';

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
    encrypt: vi.fn().mockReturnValue([mocks.MOCK_VALUE_ENCRYPTED]),
    decrypt: vi.fn().mockReturnValue(mocks.MOCK_VALUE_DECRYPTED),
  };
});

import { fetchAfisBusinessPartnerDetails, fetchIsKnownInAFIS } from './afis';
import { jsonCopy } from '../../../universal/helpers/utils';

const BASE_ROUTE = '/afis/RESTAdapter';
const ROUTES = {
  businesspartnerBSN: `${BASE_ROUTE}/businesspartner/BSN/`,
  businesspartnerKVK: `${BASE_ROUTE}/businesspartner/KVK/`,
  businesspartnerDetails: `${BASE_ROUTE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner?$filter=BusinessPartner%20eq%20%27213423%27&$select=BusinessPartner, FullName, AddressID, CityName, Country, HouseNumber, HouseNumberSupplementText, PostalCode, Region, StreetName, StreetPrefixName, StreetSuffixName`,
  businesspartnerPhonenumber: `${BASE_ROUTE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber?$filter=AddressID%20eq%20%27430844%27`,
  businesspartnerEmailAddress: `${BASE_ROUTE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress?$filter=AddressID%20eq%20%27430844%27`,
};

const REQUEST_ID = '456';

describe('Afis', () => {
  describe('fetchIsKnownInAFIS ', () => {
    const RESPONSE_BODIES = {
      BSNFound: {
        BSN: 111111111,
        Zakenpartnernummer: '3333333333',
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

    const TRANSFORMED_RESPONSES = {
      isKnown: {
        content: {
          isKnown: true,
          businessPartnerIdEncrypted: mocks.MOCK_VALUE_ENCRYPTED,
        },
        status: 'OK',
      },
      isNotKnown: {
        content: {
          isKnown: false,
          businessPartnerIdEncrypted: null,
        },
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
          getAuthProfileAndToken('private')
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
          getAuthProfileAndToken('private')
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
          getAuthProfileAndToken('commercial')
        );

        expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isKnown);
      });

      it("Transforms response to '{isKnown: false }' when KVK is not found", async () => {
        remoteApi
          .post(ROUTES.businesspartnerKVK)
          .reply(200, RESPONSE_BODIES.KVKNotFound);

        const response = await fetchIsKnownInAFIS(
          REQUEST_ID,
          getAuthProfileAndToken('commercial')
        );

        expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isNotKnown);
      });

      it('Handles a response with multiple vestigingen', async () => {
        remoteApi
          .post(ROUTES.businesspartnerKVK)
          .reply(200, RESPONSE_BODIES.KVKNotFoundVestigingen);

        const response = await fetchIsKnownInAFIS(
          REQUEST_ID,
          getAuthProfileAndToken('commercial')
        );

        expect(response).toStrictEqual(TRANSFORMED_RESPONSES.isKnown);
      });
    });

    describe('Error behavior ', () => {
      it('Handles a bad request by returning an AxiosError', async () => {
        remoteApi.post(ROUTES.businesspartnerBSN).reply(400);

        const response = await fetchIsKnownInAFIS(
          REQUEST_ID,
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
          REQUEST_ID,
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
    });

    it('Handles getting just null as a response by returning an AxiosError', async () => {
      remoteApi.post(ROUTES.businesspartnerBSN).reply(200, {});

      const response = await fetchIsKnownInAFIS(
        REQUEST_ID,
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

  describe('fetchAfisBusinessPartner ', () => {
    const responseBodyBusinessDetails = {
      feed: {
        entry: [
          {
            content: {
              '@type': 'application/xml',
              properties: {
                BusinessPartner: 515177,
                FullName: 'Taxon Expeditions BV',
                AddressID: 430844,
                CityName: 'Leiden',
                Country: 'NL',
                HouseNumber: 20,
                HouseNumberSupplementText: '',
                PostalCode: '2311 VW',
                Region: '',
                StreetName: 'Rembrandtstraat',
                StreetPrefixName: '',
                StreetSuffixName: '',
              },
            },
          },
        ],
      },
    };

    const responseBodyBusinessPhonenumber = {
      feed: {
        entry: [
          {
            content: {
              '@type': 'application/xml',
              properties: {
                InternationalPhoneNumber: '+31622030313',
              },
            },
          },
        ],
      },
    };

    const responseBodyBusinessEmailAddress = {
      feed: {
        entry: [
          {
            content: {
              '@type': 'application/xml',
              properties: {
                SearchEmailAddress: 'xxmail@arjanappel.nl',
              },
            },
          },
        ],
      },
    };

    it('fetches and transforms business partner details correctly', async () => {
      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .reply(200, responseBodyBusinessDetails);

      remoteApi
        .get(ROUTES.businesspartnerPhonenumber)
        .reply(200, responseBodyBusinessPhonenumber);

      remoteApi
        .get(ROUTES.businesspartnerEmailAddress)
        .reply(200, responseBodyBusinessEmailAddress);

      const businessPartnerId = 213423;
      const response = await fetchAfisBusinessPartnerDetails(businessPartnerId);

      expect(response).toMatchInlineSnapshot(`
        {
          "content": {
            "address": "Rembrandtstraat 20 2311 VW Leiden",
            "addressId": 430844,
            "businessPartnerId": 515177,
            "email": "xxmail@arjanappel.nl",
            "fullName": "Taxon Expeditions BV",
            "phone": "+31622030313",
          },
          "status": "OK",
        }
      `);
    });

    it('transforms content to null when there is no AddressID', async () => {
      const responseBodyBusinessDetailsWithoutAddressID = jsonCopy(
        responseBodyBusinessDetails
      );

      delete responseBodyBusinessDetailsWithoutAddressID.feed.entry[0].content
        .properties.AddressID;

      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .reply(200, responseBodyBusinessDetailsWithoutAddressID);

      remoteApi
        .get(ROUTES.businesspartnerPhonenumber)
        .reply(200, responseBodyBusinessPhonenumber);

      remoteApi
        .get(ROUTES.businesspartnerEmailAddress)
        .reply(200, responseBodyBusinessEmailAddress);

      const response = await fetchAfisBusinessPartnerDetails(213423);

      expect(response).toMatchInlineSnapshot(`
        {
          "content": {
            "address": "Rembrandtstraat 20 2311 VW Leiden",
            "addressId": undefined,
            "businessPartnerId": 515177,
            "fullName": "Taxon Expeditions BV",
          },
          "status": "OK",
        }
      `);
    });

    it('handles Error in one of the endpoints', async () => {
      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .reply(200, responseBodyBusinessDetails);

      remoteApi
        .get(ROUTES.businesspartnerPhonenumber)
        .replyWithError('error retrieving doc');

      remoteApi
        .get(ROUTES.businesspartnerEmailAddress)
        .replyWithError('error retrieving doc');

      const businessPartnerId = 213423;
      let response = await fetchAfisBusinessPartnerDetails(businessPartnerId);

      expect(response).toMatchObject({
        content: {
          businessPartnerId: 515177,
          fullName: 'Taxon Expeditions BV',
          address: 'Rembrandtstraat 20 2311 VW Leiden',
          addressId: 430844,
        },
        status: 'OK',
        failedDependencies: {
          phone: {
            content: null,
            message: 'error retrieving doc',
            status: 'ERROR',
          },
          email: {
            content: null,
            message: 'error retrieving doc',
            status: 'ERROR',
          },
        },
      });
    });

    it('handles server error as expected', async () => {
      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .replyWithError('error retrieving doc');

      const businessPartnerId = 213423;
      const response = await fetchAfisBusinessPartnerDetails(businessPartnerId);

      expect(response).toMatchInlineSnapshot(`
        {
          "content": null,
          "message": "error retrieving doc",
          "status": "ERROR",
        }
      `);
    });
  });
});
