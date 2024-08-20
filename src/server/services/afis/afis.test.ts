import { getAuthProfileAndToken, remoteApi } from '../../../test-utils';
import { describe } from 'vitest';
import { encrypt } from '../../../server/helpers/encrypt-decrypt';

const mockEncrypt = (text: string): string => `encrypted-${text}`;
const mockDecrypt = (text: string): string => text.replace('encrypted-', '');

vi.mock('../../../server/helpers/encrypt-decrypt', async (importOriginal) => {
  const original: object = await importOriginal();
  return {
    ...original,
    encrypt: vi.fn((text: string) => [mockEncrypt(text)]),
    decrypt: vi.fn((text: string) => mockDecrypt(text)),
  };
});

import { fetchAfisBusinessPartner, fetchIsKnownInAFIS } from './afis';
import { JWA } from 'node-jose';

const BASE_ROUTE = '/afis/RESTAdapter';
const ROUTES = {
  businesspartnerBSN: `${BASE_ROUTE}/businesspartner/BSN/`,
  businesspartnerKVK: `${BASE_ROUTE}/businesspartner/KVK/`,
  businesspartnerDetails: `${BASE_ROUTE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner?$filter=BusinessPartner%20eq%20%27213423%27`,
  businesspartnerPhonenumber: `${BASE_ROUTE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber?$filter=AddressID%20eq%20%27430844%27`,
  businesspartnerEmailAddress: `${BASE_ROUTE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress?$filter=AddressID%20eq%20%27430844%27`,
};

const REQUEST_ID = '456';
const access_token = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

describe('Afis', () => {
  describe('fetchIsKnownInAFIS ', () => {
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
        content: {
          isKnown: true,
          businessPartnerIdEncrypted: encrypt('9999999999')[0],
        },
        status: 'OK',
      },
      isNotKnown: {
        content: {
          isKnown: false,
          businessPartnerIdEncrypted: encrypt('9999999999')[0],
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

        expect(response).toStrictEqual({
          ...TRANSFORMED_RESPONSES.isKnown,
          content: {
            ...TRANSFORMED_RESPONSES.isKnown.content,
            businessPartnerIdEncrypted: encrypt('3333333333')[0],
          },
        });
      });

      it("Transforms response to '{isKnown: false }' when BSN is not found", async () => {
        remoteApi.post(ROUTES.businesspartnerBSN).reply(200, {
          BSN: 123456789,
          Gevonden: 'Nee',
          businessPartnerIdEncrypted: '4444444444',
        });

        const response = await fetchIsKnownInAFIS(
          REQUEST_ID,
          getAuthProfileAndToken('private')
        );

        expect(response).toStrictEqual({
          ...TRANSFORMED_RESPONSES.isNotKnown,
          content: {
            ...TRANSFORMED_RESPONSES.isNotKnown.content,
            businessPartnerIdEncrypted: 'encrypted-',
          },
        });
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

        expect(response).toStrictEqual({
          ...TRANSFORMED_RESPONSES.isKnown,
          content: {
            ...TRANSFORMED_RESPONSES.isKnown.content,
            businessPartnerIdEncrypted: encrypt('4444444444')[0],
          },
        });
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
          getAuthProfileAndToken('commercial')
        );

        expect(response).toStrictEqual({
          ...TRANSFORMED_RESPONSES.isNotKnown,
          content: {
            ...TRANSFORMED_RESPONSES.isNotKnown.content,
            businessPartnerIdEncrypted: 'encrypted-',
          },
        });
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
          getAuthProfileAndToken('commercial')
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
          "businessPartnerIdEncrypted": "encrypted-",
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

      const encryptedRequestId = encrypt('213423')[0];
      const response = await fetchAfisBusinessPartner(
        REQUEST_ID,
        encryptedRequestId
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "content": {
            "BusinessPartner": 515177,
            "BusinessPartnerAddress": "Rembrandtstraat 202311 VW Leiden",
            "BusinessPartnerFullName": "Taxon Expeditions BV",
            "EmailAddress": "xxmail@arjanappel.nl",
            "PhoneNumber": "+31622030313",
          },
          "status": "OK",
        }
      `);
    });

    it('transforms content to null, when not both endpoints retrieve data', async () => {
      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .reply(200, responseBodyBusinessDetails);

      remoteApi.get(ROUTES.businesspartnerPhonenumber).reply(200, {});

      remoteApi
        .get(ROUTES.businesspartnerEmailAddress)
        .reply(200, {});

      const encryptedRequestId = encrypt('213423')[0];
      const response = await fetchAfisBusinessPartner(
        REQUEST_ID,
        encryptedRequestId
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "content": null,
          "status": "OK",
        }
      `);
    });

    it('transforms content to null when there is no AddressID', async () => {
      const responseBodyBusinessDetailsWithoutAddressID =
        responseBodyBusinessDetails;

      delete responseBodyBusinessDetailsWithoutAddressID?.feed?.entry[0]
        ?.content?.properties?.AddressID;

      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .reply(200, responseBodyBusinessDetailsWithoutAddressID);

      remoteApi
        .get(ROUTES.businesspartnerPhonenumber)
        .reply(200, responseBodyBusinessPhonenumber);

      remoteApi
        .get(ROUTES.businesspartnerEmailAddress)
        .reply(200, responseBodyBusinessEmailAddress);

      const response = await fetchAfisBusinessPartner(REQUEST_ID, '213423');

      expect(response).toMatchInlineSnapshot(`
        {
          "content": null,
          "status": "OK",
        }
      `);
    });

    it('handles missing address data', async () => {
      const responseWithoutAddress = {
        feed: {
          entry: [
            {
              content: {
                properties: {
                  BusinessPartner: '213423',
                  FullName: 'Test Company',
                },
              },
            },
          ],
        },
      };

      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .reply(200, responseBodyBusinessDetails);

      remoteApi
        .get(ROUTES.businesspartnerPhonenumber)
        .reply(200, responseWithoutAddress);

      remoteApi
        .get(ROUTES.businesspartnerEmailAddress)
        .reply(200, responseWithoutAddress);

      const encryptedRequestId = encrypt('213423')[0];
      const response = await fetchAfisBusinessPartner(
        REQUEST_ID,
        encryptedRequestId
      );

      expect(response).toMatchObject({
        content: null,
        status: 'OK',
      });
    });

    it('handles server error as expected', async () => {
      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .replyWithError('error retrieving doc');

      const encryptedRequestId = encrypt('213423')[0];
      const response = await fetchAfisBusinessPartner(
        REQUEST_ID,
        encryptedRequestId
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
});
