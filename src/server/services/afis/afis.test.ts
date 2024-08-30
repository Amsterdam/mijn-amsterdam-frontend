import { describe } from 'vitest';
import { remoteApi, getAuthProfileAndToken } from '../../../test-utils';

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

import {
  fetchAfisBusinessPartnerDetails,
  fetchAfisFacturen,
  fetchAfisDocument,
  fetchIsKnownInAFIS,
} from './afis';
import { jsonCopy } from '../../../universal/helpers/utils';
import { AfisFactuur } from './afis-types';
import { ApiSuccessResponse } from '../../../universal/helpers/api';

const FACTUUR_NUMMER = '12346789';
const GENERIC_ID = '12346789';
const ADRRESS_ID = 430844;

const BASE_ROUTE = '/afis/RESTAdapter';
const FACTUREN_ROUTE = `${BASE_ROUTE}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM`;
const ROUTES = {
  businesspartnerBSN: `${BASE_ROUTE}/businesspartner/BSN/`,
  businesspartnerKVK: `${BASE_ROUTE}/businesspartner/KVK/`,
  businesspartnerDetails: `${BASE_ROUTE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner?$filter=BusinessPartner%20eq%20%27${GENERIC_ID}%27&$select=BusinessPartner,%20FullName,%20AddressID,%20CityName,%20Country,%20HouseNumber,%20HouseNumberSupplementText,%20PostalCode,%20Region,%20StreetName,%20StreetPrefixName,%20StreetSuffixName`,
  businesspartnerPhonenumber: `${BASE_ROUTE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber?$filter=AddressID%20eq%20%27${ADRRESS_ID}%27`,
  businesspartnerEmailAddress: `${BASE_ROUTE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress?$filter=AddressID%20eq%20%27${ADRRESS_ID}%27`,
  openstaandeFacturen: `${FACTUREN_ROUTE}?$inlinecount=allpages&$filter=Customer eq '${GENERIC_ID}' and IsCleared eq false and (DunningLevel eq '0' or DunningBlockingReason eq 'D')&$select=ReverseDocument,Paylink,PostingDate,ProfitCenterName,InvoiceNo,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate&$orderBy=NetDueDate asc, PostingDate asc`,
  geslotenFacturen: `${FACTUREN_ROUTE}?$inlinecount=allpages&$filter=Customer eq '${GENERIC_ID}' and IsCleared eq true and (DunningLevel eq '0' or ReverseDocument ne '')&$select=ReverseDocument,Paylink,PostingDate,ProfitCenterName,InvoiceNo,AmountInBalanceTransacCrcy,NetPaymentAmount,NetDueDate,DunningLevel,DunningBlockingReason,SEPAMandate&$orderBy=NetDueDate asc, PostingDate asc`,
  documentDownload: `${BASE_ROUTE}/getDebtorInvoice/API_CV_ATTACHMENT_SRV/`,
  documentID: `${BASE_ROUTE}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_CDS_TOA02?$filter=AccountNumber eq '${FACTUUR_NUMMER}'&$select=ArcDocId`,
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
                BusinessPartner: GENERIC_ID,
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

      const response = await fetchAfisBusinessPartnerDetails(
        REQUEST_ID,
        GENERIC_ID
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "content": {
            "addressId": 430844,
            "businessPartnerId": "12346789",
            "email": "xxmail@arjanappel.nl",
            "fullName": "Taxon Expeditions BV",
            "phone": "+31622030313",
          },
          "status": "OK",
        }
      `);
    });

    it('returns just the business partner details when there is no AddressID', async () => {
      const responseBodyBusinessDetailsWithoutAddressID = jsonCopy(
        responseBodyBusinessDetails
      );

      delete responseBodyBusinessDetailsWithoutAddressID.feed.entry[0].content
        .properties.AddressID;

      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .reply(200, responseBodyBusinessDetailsWithoutAddressID);

      const response = await fetchAfisBusinessPartnerDetails(
        REQUEST_ID,
        GENERIC_ID
      );

      expect(response).toMatchInlineSnapshot(`
        {
          "content": {
            "addressId": null,
            "businessPartnerId": "12346789",
            "fullName": "Taxon Expeditions BV",
          },
          "status": "OK",
        }
      `);
    });

    it('returns a partial error when there is an error fetching the phone number or email address', async () => {
      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .reply(200, responseBodyBusinessDetails);

      remoteApi
        .get(ROUTES.businesspartnerPhonenumber)
        .replyWithError('error retrieving doc');

      remoteApi
        .get(ROUTES.businesspartnerEmailAddress)
        .replyWithError('error retrieving doc');

      let response = await fetchAfisBusinessPartnerDetails(
        REQUEST_ID,
        GENERIC_ID
      );

      expect(response).toMatchObject({
        content: {
          businessPartnerId: GENERIC_ID,
          fullName: 'Taxon Expeditions BV',
          address: 'Rembrandtstraat 20 2311 VW Leiden',
          addressId: ADRRESS_ID,
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

    it('returns an error when there is an error fetching the business partner details', async () => {
      remoteApi
        .get(ROUTES.businesspartnerDetails)
        .replyWithError('error retrieving doc');

      const response = await fetchAfisBusinessPartnerDetails(
        REQUEST_ID,
        GENERIC_ID
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

  it('returns null properties when the business partner details data quality is not sufficient', async () => {
    remoteApi.get(ROUTES.businesspartnerDetails).reply(200, {
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
          "addressId": null,
          "businessPartnerId": null,
          "fullName": null,
        },
        "status": "OK",
      }
    `);

    // also test when the response is an array
    remoteApi.get(ROUTES.businesspartnerDetails).reply(200, {
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
          "addressId": null,
          "businessPartnerId": null,
          "fullName": null,
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
        .reply(
          200,
          require('../../../../mocks/fixtures/afis/openstaande-facturen.json')
        );

      const openParams = {
        state: 'open' as 'open',
        businessPartnerID: GENERIC_ID,
        top: undefined,
      };

      const response = (await fetchAfisFacturen(
        REQUEST_ID,
        authProfileAndToken.profile.sid,
        openParams
      )) as ApiSuccessResponse<AfisFactuur[]>;

      // All fields are listed here to test correct formatting.
      const openFactuur = response.content[0];
      expect(openFactuur).toStrictEqual({
        afzender: 'Moneymakers inc.',
        amountOwed: -0.98, // Floating point negative number tested here.
        amountOwedFormatted: '€ -0,98',
        factuurNummer: '5555555',
        status: 'openstaand',
        paymentDueDate: '2023-03-23T00:00:00',
        paymentDueDateFormatted: '23 maart 2023',
        debtClearingDate: null,
        debtClearingDateFormatted: null,
        paylink: 'http://localhost:3100/mocks-server/afis/paylink',
        datePublished: '2023-03-23T00:00:00',
        datePublishedFormatted: '23 maart 2023',
        documentDownloadLink:
          'http://bff-api-host/api/v1/services/afis/facturen/document/xx-encrypted-xx',
      });

      const automatischeIncassoFactuur = response.content[1];
      expect(automatischeIncassoFactuur.status).toBe('automatische-incasso');
      expect(automatischeIncassoFactuur.paymentDueDate).toBe(null);

      const inDispuutInvoice = response.content[2];
      expect(inDispuutInvoice.status).toBe('in-dispuut');

      const unknownStatusInvoice = response.content[3];
      expect(unknownStatusInvoice.status).toBe('onbekend');
    });

    test('Afgehandelde factuur data is transformed and url is correctly formatted', async () => {
      remoteApi
        .get(ROUTES.geslotenFacturen)
        .reply(
          200,
          require('../../../../mocks/fixtures/afis/afgehandelde-facturen.json')
        );

      const closedParams = {
        state: 'closed' as 'closed',
        businessPartnerID: GENERIC_ID,
        top: undefined,
      };

      const response = (await fetchAfisFacturen(
        REQUEST_ID,
        authProfileAndToken.profile.sid,
        closedParams
      )) as ApiSuccessResponse<AfisFactuur[]>;

      const geannuleerdeInvoice = response.content[0];
      expect(geannuleerdeInvoice).toStrictEqual({
        afzender: '',
        amountOwed: 0,
        amountOwedFormatted: '€ 0',
        datePublished: null,
        datePublishedFormatted: null,
        documentDownloadLink:
          'http://bff-api-host/api/v1/services/afis/facturen/document/xx-encrypted-xx',
        paymentDueDate: '2023-06-12T00:00:00',
        paymentDueDateFormatted: '12 juni 2023',
        debtClearingDate: null,
        debtClearingDateFormatted: null,
        factuurNummer: '',
        paylink: null,
        status: 'betaald',
      });

      const betaaldeInvoice = response.content[1];
      expect(betaaldeInvoice.status).toStrictEqual('betaald');

      const unknownStatusInvoice = response.content[2];
      expect(unknownStatusInvoice.status).toStrictEqual('onbekend');
    });
  });

  describe('fetchAfisInvoiceDocument', async () => {
    test('Success response correctly formatted', async () => {
      remoteApi
        .get(ROUTES.documentID)
        .reply(200, require('../../../../mocks/fixtures/afis/arc-doc-id.json'));
      remoteApi
        .post(ROUTES.documentDownload)
        .reply(200, require('../../../../mocks/fixtures/afis/document.json'));

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
