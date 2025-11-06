const httpConstants = require('http2').constants;

const e = require('express');

const settings = require('../settings');

const BASE = '/afis';
const REST_BASE = `${BASE}/RESTAdapter`;

module.exports = [
  {
    id: 'post-afis-auth-token',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/OAuthServer`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            access_token: '123xyz',
            token_type: 'bearer',
            expires_in: 3600,
          },
        },
      },
    ],
  },
  {
    id: 'post-afis-businesspartner-bsn',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/businesspartner/BSN`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            BSN: 999999999,
            Zakenpartnernummer: '8888888888',
            Blokkade: 'Nee',
            Afnemers_indicatie: 'Nee',
            Gevonden: 'Ja',
          },
        },
      },
    ],
  },
  {
    id: 'post-afis-businesspartner-kvk',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/businesspartner/KVK`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            Record: {
              KVK: 55555555,
              Zakenpartnernummer: '8888888888',
              Blokkade: 'Nee',
              Gevonden: 'Ja',
            },
          },
        },
      },
    ],
  },
  {
    id: 'get-afis-businesspartner-details',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            feed: {
              entry: [
                {
                  content: {
                    '@type': 'application/xml',
                    properties: {
                      BusinessPartner: 515177,
                      BusinessPartnerFullName: 'Taxon Expeditions BV',
                    },
                  },
                },
              ],
            },
          },
        },
      },
    ],
  },
  {
    id: 'get-afis-businesspartner-address',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerAddress`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
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
          },
        },
      },
    ],
  },
  {
    id: 'get-afis-businesspartner-phonenumber',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
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
          },
        },
      },
    ],
  },
  {
    id: 'get-afis-businesspartner-emailaddress',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
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
          },
        },
      },
    ],
  },
  {
    id: 'get-afis-facturen',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const stateFilters = {
              openstaande: 'IsCleared eq false',
              afgehandeldetermijn: `and PaymentTerms gt 'B' and SEPAMandate ne '' `,
              afgehandelde: `DunningLevel ne '3' or ReverseDocument ne ''`,
              overgedragen: `DunningLevel eq '3'`,
            };

            const stateName = Object.entries(stateFilters).find(
              ([_name, filterValueSegment]) => {
                return req.query?.$filter?.includes(filterValueSegment);
              }
            )?.[0];

            if (!stateName) {
              return res.status(httpConstants.HTTP_STATUS_FORBIDDEN).end();
            }

            const facturenByState = {
              openstaande: require('../fixtures/afis/openstaande-facturen.json'),
              afgehandelde: require('../fixtures/afis/afgehandelde-facturen.json'),
              afgehandeldetermijn: require('../fixtures/afis/afgehandeldetermijn-facturen.json'),
              overgedragen: require('../fixtures/afis/overgedragen-facturen.json'),
            };

            let feedEntries = [...facturenByState[stateName].feed.entry];

            // Afgehandelde termijnfacturen can also be present in the afgehandelde facturen.
            // We exclude them in the BFF Afis-facturen-service if they belong to a factuur that also has openstaande termijnen.
            // Therefore we need to merge these results here for the mock to behave the same.
            if (stateName === 'afgehandelde') {
              feedEntries = [
                ...feedEntries,
                ...facturenByState.afgehandeldetermijn.feed.entry,
              ];
            }

            const count = feedEntries.length;

            if (req.query?.$top) {
              feedEntries = feedEntries.slice(0, Number(req.query.$top));
            }

            return res.send({
              feed: {
                entry: feedEntries,
                count,
              },
            });
          },
        },
      },
    ],
  },
  {
    id: 'post-afis-factuur-download',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/getDebtorInvoice/API_CV_ATTACHMENT_SRV/`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: require('../fixtures/afis/document.json'),
        },
      },
    ],
  },
  {
    id: 'get-afis-factuur-document-id',
    url: `${settings.MOCK_BASE_PATH}${REST_BASE}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_CDS_TOA02`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: require('../fixtures/afis/arc-doc-id.json'),
        },
      },
    ],
  },
  {
    id: 'get-afis-paylink',
    url: `${settings.MOCK_BASE_PATH}/afis/paylink`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            const htmlResponse = `<h1>Afis factuur betalen</h1><button onclick="history.back()">Betaal factuur</button>`;
            res.send(htmlResponse);
          },
        },
      },
    ],
  },
];
