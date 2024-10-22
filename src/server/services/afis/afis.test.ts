import { describe } from 'vitest';

import { fetchIsKnownInAFIS } from './afis';
import { fetchAfisBusinessPartnerDetails } from './afis-business-partner';
import { fetchAfisDocument } from './afis-documents';
import { fetchAfisFacturen } from './afis-facturen';
import { AfisFacturenParams } from './afis-types';
import AFIS_AFGEHANDELDE_FACTUREN from './test-fixtures/afgehandelde-facturen.json';
import AFIS_OPENSTAAANDE_FACTUREN from './test-fixtures/openstaande-facturen.json';
import ARC_DOC from '../../../../mocks/fixtures/afis/arc-doc-id.json';
import DOCUMENT_DOWNLOAD_RESPONSE from '../../../../mocks/fixtures/afis/document.json';
import { getAuthProfileAndToken, remoteApi } from '../../../test-utils';

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

const FACTUUR_NUMMER = '12346789';
const GENERIC_ID = '12346789';
const BASE_ROUTE = '/afis/RESTAdapter';

const ROUTES = {
  token: `${BASE_ROUTE}/OAuthServer`,
  businesspartnerBSN: `${BASE_ROUTE}/businesspartner/BSN/`,
  businesspartnerKVK: `${BASE_ROUTE}/businesspartner/KVK/`,
  businesspartnerFullName: (uri: string) => {
    return decodeURI(uri).includes(
      'ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner'
    );
  },
  businesspartnerAddressId: (uri: string) => {
    return decodeURI(uri).includes(
      'ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerAddress'
    );
  },
  businesspartnerPhonenumber: (uri: string) => {
    return decodeURI(uri).includes(
      `ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber`
    );
  },
  businesspartnerEmailAddress: (uri: string) => {
    return decodeURI(uri).includes(
      `ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress`
    );
  },
  openstaandeFacturen: (uri: string) => {
    return decodeURI(uri).includes(`IsCleared eq false`);
  },
  geslotenFacturen: (uri: string) => {
    return decodeURI(uri).includes('and IsCleared eq true');
  },
  documentDownload: (uri: string) => {
    return decodeURI(uri).includes('API_CV_ATTACHMENT_SRV');
  },
  documentID: (uri: string) => {
    return decodeURI(uri).includes('ZFI_CDS_TOA02');
  },
};

const REQUEST_ID = '456';

describe('Afis', () => {
  beforeEach(() => {
    remoteApi.post(ROUTES.token).reply(200, {
      access_token: '123xyz',
      token_type: 'bearer',
      expires_in: 3600,
    });
  });

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

  describe('fetchAfisBusinessPartnerDetails ', () => {
    const responseBodyBusinessPartnerAddressId = {
      feed: {
        entry: [
          {
            content: {
              '@type': 'application/xml',
              properties: {
                AddressID: 430844,
              },
            },
          },
        ],
      },
    };

    const responseBodyBusinessPartnerFullName = {
      feed: {
        entry: [
          {
            content: {
              '@type': 'application/xml',
              properties: {
                BusinessPartnerFullName: 'Taxon Expeditions BV',
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
                EmailAddress: 'xxmail@arjanappel.nl',
              },
            },
          },
        ],
      },
    };

    it('fetches and transforms business partner details correctly', async () => {
      remoteApi
        .get(ROUTES.businesspartnerFullName)
        .reply(200, responseBodyBusinessPartnerFullName);

      remoteApi
        .get(ROUTES.businesspartnerAddressId)
        .reply(200, responseBodyBusinessPartnerAddressId);

      remoteApi
        .get(ROUTES.businesspartnerPhonenumber)
        .reply(200, responseBodyBusinessPhonenumber);

      remoteApi
        .get(ROUTES.businesspartnerEmailAddress)
        .reply(200, responseBodyBusinessEmailAddress);

      const response = await fetchAfisBusinessPartnerDetails(
        REQUEST_ID,
        GENERIC_ID
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "content": {
            "businessPartnerId": "12346789",
            "email": "xxmail@arjanappel.nl",
            "fullName": "Taxon Expeditions BV",
            "phone": "+31622030313",
          },
          "status": "OK",
        }
      `);
    });

    it('returns just the business partner fullname when there is no AddressID', async () => {
      remoteApi
        .get(ROUTES.businesspartnerFullName)
        .reply(200, responseBodyBusinessPartnerFullName);

      const response = await fetchAfisBusinessPartnerDetails(
        REQUEST_ID,
        GENERIC_ID
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "content": {
            "businessPartnerId": "12346789",
            "fullName": "Taxon Expeditions BV",
          },
          "failedDependencies": {
            "email": {
              "content": null,
              "message": "Could not get email, missing required query param addressId",
              "status": "ERROR",
            },
            "phone": {
              "content": null,
              "message": "Could not get phone, missing required query param addressId",
              "status": "ERROR",
            },
          },
          "status": "OK",
        }
      `);
    });

    it('returns a partial error when there is an error fetching the phone number or email address', async () => {
      remoteApi
        .get(ROUTES.businesspartnerFullName)
        .reply(200, responseBodyBusinessPartnerAddressId);

      const response = await fetchAfisBusinessPartnerDetails(
        REQUEST_ID,
        GENERIC_ID
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "content": {
            "businessPartnerId": "12346789",
            "fullName": null,
          },
          "failedDependencies": {
            "email": {
              "content": null,
              "message": "Could not get email, missing required query param addressId",
              "status": "ERROR",
            },
            "phone": {
              "content": null,
              "message": "Could not get phone, missing required query param addressId",
              "status": "ERROR",
            },
          },
          "status": "OK",
        }
      `);
    });

    it('returns an error when there is an error fetching the business partner details', async () => {
      remoteApi.get(ROUTES.businesspartnerFullName).reply(500);

      const response = await fetchAfisBusinessPartnerDetails(
        REQUEST_ID,
        GENERIC_ID
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "content": {
            "businessPartnerId": "12346789",
          },
          "failedDependencies": {
            "email": {
              "content": null,
              "message": "Could not get email, missing required query param addressId",
              "status": "ERROR",
            },
            "fullName": {
              "code": 500,
              "content": null,
              "message": "Request failed with status code 500",
              "status": "ERROR",
            },
            "phone": {
              "content": null,
              "message": "Could not get phone, missing required query param addressId",
              "status": "ERROR",
            },
          },
          "status": "OK",
        }
      `);
    });
  });

  it('Omits email and phone properties when the business partner details data quality is not sufficient', async () => {
    remoteApi.get(ROUTES.businesspartnerFullName).reply(200, {
      feed: {
        entry: [
          {
            content: {
              properties: 'not an object',
            },
          },
        ],
      },
    });

    const response = await fetchAfisBusinessPartnerDetails(
      REQUEST_ID,
      GENERIC_ID
    );

    expect(response).toMatchInlineSnapshot(`
      {
        "content": {
          "businessPartnerId": "12346789",
          "fullName": null,
        },
        "failedDependencies": {
          "email": {
            "content": null,
            "message": "Could not get email, missing required query param addressId",
            "status": "ERROR",
          },
          "phone": {
            "content": null,
            "message": "Could not get phone, missing required query param addressId",
            "status": "ERROR",
          },
        },
        "status": "OK",
      }
    `);

    // also test when the response is an array
    remoteApi.get(ROUTES.businesspartnerFullName).reply(200, {
      feed: {
        entry: [
          {
            content: {
              properties: [],
            },
          },
        ],
      },
    });

    const response2 = await fetchAfisBusinessPartnerDetails(
      REQUEST_ID,
      GENERIC_ID
    );

    expect(response2).toMatchInlineSnapshot(`
      {
        "content": {
          "businessPartnerId": "12346789",
          "fullName": null,
        },
        "failedDependencies": {
          "email": {
            "content": null,
            "message": "Could not get email, missing required query param addressId",
            "status": "ERROR",
          },
          "phone": {
            "content": null,
            "message": "Could not get phone, missing required query param addressId",
            "status": "ERROR",
          },
        },
        "status": "OK",
      }
    `);
  });

  describe('fetchAfisFacturen', async () => {
    const authProfileAndToken = getAuthProfileAndToken('private');

    test('Openstaande factuur data is transformed and url is correctly formatted', async () => {
      remoteApi
        .get(ROUTES.openstaandeFacturen)
        .reply(200, AFIS_OPENSTAAANDE_FACTUREN);

      const openParams: AfisFacturenParams = {
        state: 'open',
        businessPartnerID: GENERIC_ID,
      };

      const response = await fetchAfisFacturen(
        REQUEST_ID,
        authProfileAndToken.profile.sid,
        openParams
      );

      // All fields are listed here to test correct formatting.
      const openFactuur = response.content?.facturen[0];
      expect(openFactuur).toMatchInlineSnapshot(`
        {
          "afzender": "Bedrijf: Ok",
          "amountOwed": 343,
          "amountOwedFormatted": "€ 343,00",
          "datePublished": "2023-11-21T00:00:00",
          "datePublishedFormatted": "21 november 2023",
          "debtClearingDate": null,
          "debtClearingDateFormatted": null,
          "documentDownloadLink": "http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx",
          "factuurDocumentId": "5555555",
          "factuurNummer": "5555555",
          "id": "5555555",
          "link": {
            "title": "5555555",
            "to": "http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx",
          },
          "paylink": "http://localhost:3100/mocks-server/afis/paylink",
          "paymentDueDate": "2023-12-21T00:00:00",
          "paymentDueDateFormatted": "21 december 2023",
          "status": "in-dispuut",
          "statusDescription": "€ 343,00 in dispuut",
        }
      `);

      const automatischeIncassoFactuur = response.content?.facturen[1];
      expect(automatischeIncassoFactuur?.status).toBe('openstaand');
      expect(automatischeIncassoFactuur?.paymentDueDate).toBe(
        '2023-12-12T00:00:00'
      );

      const inDispuutInvoice = response.content?.facturen[2];
      expect(inDispuutInvoice?.status).toBe('in-dispuut');

      const geldTerugInvoice = response.content?.facturen[3];
      expect(geldTerugInvoice?.status).toBe('geld-terug');
      expect(geldTerugInvoice?.statusDescription.includes('-')).toBe(false);

      const unknownStatusInvoice = response.content?.facturen[4];
      expect(unknownStatusInvoice?.status).toBe('onbekend');
    });

    test('Afgehandelde factuur data is transformed and url is correctly formatted', async () => {
      remoteApi
        .get(ROUTES.geslotenFacturen)
        .reply(200, AFIS_AFGEHANDELDE_FACTUREN);

      const closedParams: AfisFacturenParams = {
        state: 'afgehandeld',
        businessPartnerID: GENERIC_ID,
        top: undefined,
      };

      const response = await fetchAfisFacturen(
        REQUEST_ID,
        authProfileAndToken.profile.sid,
        closedParams
      );

      const geannuleerdeInvoice = response.content?.facturen[0];
      expect(geannuleerdeInvoice).toMatchInlineSnapshot(`
        {
          "afzender": "Lisan al Gaib inc.",
          "amountOwed": 0,
          "amountOwedFormatted": "€ 0",
          "datePublished": null,
          "datePublishedFormatted": null,
          "debtClearingDate": null,
          "debtClearingDateFormatted": null,
          "documentDownloadLink": "http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx",
          "factuurDocumentId": "INV-2023-010",
          "factuurNummer": "INV-2023-010",
          "id": "INV-2023-010",
          "link": {
            "title": "INV-2023-010",
            "to": "http://bff-api-host/api/v1/services/afis/facturen/document?id=xx-encrypted-xx",
          },
          "paylink": null,
          "paymentDueDate": "2023-12-21T00:00:00",
          "paymentDueDateFormatted": "21 december 2023",
          "status": "geannuleerd",
          "statusDescription": "Geannuleerd",
        }
      `);

      const betaaldeInvoice = response.content?.facturen[1];
      expect(betaaldeInvoice?.status).toStrictEqual('geannuleerd');

      const unknownStatusInvoice = response.content?.facturen[2];
      expect(unknownStatusInvoice?.status).toStrictEqual('geannuleerd');
    });
  });

  describe('fetchAfisInvoiceDocument', async () => {
    test('Success response correctly formatted', async () => {
      remoteApi.get(ROUTES.documentID).reply(200, ARC_DOC);
      remoteApi
        .post(ROUTES.documentDownload)
        .reply(200, DOCUMENT_DOWNLOAD_RESPONSE);

      const response = await fetchAfisDocument(
        REQUEST_ID,
        getAuthProfileAndToken('private'),
        FACTUUR_NUMMER
      );

      expect(response.status).toBe('OK');
      expect(response.content?.data.length).toBeGreaterThan(0);
      expect(response.content?.mimetype).toBe('application/pdf');
      expect(response.content?.filename).toStrictEqual('FACTUUR.PDF');
    });
  });
});
