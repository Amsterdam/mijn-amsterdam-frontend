import { fetchAfisBusinessPartnerDetails } from './afis-business-partner';
import { remoteApi } from '../../../testing/utils';

const GENERIC_ID = '12346789';
const BASE_ROUTE = '/afis/RESTAdapter';

const ROUTES = {
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
};

describe('Afis Business Partner services', () => {
  const responseBodyBusinessPartnerAddressId = {
    feed: {
      entry: [
        {
          content: {
            '@type': 'application/xml',
            properties: {
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

    const response = await fetchAfisBusinessPartnerDetails({
      businessPartnerId: GENERIC_ID,
    });

    expect(response).toMatchInlineSnapshot(`
      {
        "content": {
          "address": {
            "AddressID": 430844,
            "CityName": "Leiden",
            "Country": "NL",
            "HouseNumber": 20,
            "HouseNumberSupplementText": "",
            "PostalCode": "2311 VW",
            "Region": "",
            "StreetName": "Rembrandtstraat",
            "StreetPrefixName": "",
            "StreetSuffixName": "",
          },
          "businessPartnerId": "12346789",
          "email": "xxmail@arjanappel.nl",
          "firstName": null,
          "fullAddress": "Rembrandtstraat 20
      2311 VW Leiden",
          "fullName": "Taxon Expeditions BV",
          "id": 430844,
          "lastName": null,
        },
        "status": "OK",
      }
    `);
  });

  it('returns an error when there is an error fetching the business partner details', async () => {
    remoteApi.get(ROUTES.businesspartnerFullName).reply(500);

    const response = await fetchAfisBusinessPartnerDetails({
      businessPartnerId: GENERIC_ID,
    });

    expect(response).toMatchInlineSnapshot(`
      {
        "content": null,
        "message": "Could not get full name or address for business partner 12346789",
        "status": "ERROR",
      }
    `);
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

    remoteApi.get(ROUTES.businesspartnerAddressId).reply(200, {
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

    const response = await fetchAfisBusinessPartnerDetails({
      businessPartnerId: GENERIC_ID,
    });

    expect(response).toMatchInlineSnapshot(`
    {
      "content": {
        "address": "not an object",
        "businessPartnerId": "12346789",
        "firstName": null,
        "fullAddress": "onbekend adres",
        "fullName": null,
        "id": undefined,
        "lastName": null,
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
});
