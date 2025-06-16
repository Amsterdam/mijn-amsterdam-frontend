/* eslint-disable @typescript-eslint/no-require-imports */
const httpConstants = require('http2').constants;

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

            // DO NOT adjust this mock data (tests depend on it).
            // If needed copy, mutate and let it point to the newly made copy.
            const facturenData = require(
              `../fixtures/afis/${stateName}-facturen.json`
            );

            if (req.query?.$top) {
              return res.send({
                feed: {
                  count: facturenData.feed.count,
                  entry: facturenData.feed.entry.slice(
                    0,
                    parseInt(req.query?.$top, 10)
                  ),
                },
              });
            }

            return res.send(facturenData);
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
  {
    id: 'get-afis-emandates',
    url: `${settings.MOCK_BASE_PATH}/afis/RESTAdapter/Mandate/ZGW_FI_MANDATE_SRV_01/Mandate_readSet`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            return res.send(eMandates);
          },
        },
      },
    ],
  },
  {
    id: 'post-afis-emandates',
    url: `${settings.MOCK_BASE_PATH}/afis/RESTAdapter/CreateMandate/ZGW_FI_MANDATE_SRV_01/Mandate_createSet`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            const body = req.body;
            const mandate = eMandates.find(
              (eMandate) => eMandate.IMandateId === body.IMandateId
            );
            const lastID =
              eMandates.feed.entry[eMandates.feed.entry.length - 1].IMandateId;
            const newMandete = {
              ...mandate,
              ...body,
              id: lastID + 1,
            };

            eMandates.feed.entry.push(newMandete);

            return res.send(newMandete);
          },
        },
      },
    ],
  },
  {
    id: 'put-afis-emandates',
    url: `${settings.MOCK_BASE_PATH}/afis/RESTAdapter/ChangeMandate/ZGW_FI_MANDATE_SRV_01/Mandate_changeSet(IMandateId=':mandateId')`,
    method: 'PUT',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {},
        },
      },
    ],
  },
];
