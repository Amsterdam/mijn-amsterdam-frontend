/* eslint-disable @typescript-eslint/no-require-imports */
const httpConstants = require('http2').constants;

const eMandates = require('../fixtures/afis/e-mandates.json');
const settings = require('../settings');

const BASE = '/afis';
const REST_BASE = `${BASE}/RESTAdapter`;
const BASE_URL = `${settings.MOCK_BASE_PATH}${REST_BASE}`;

module.exports = [
  {
    id: 'post-afis-auth-token',
    url: `${BASE_URL}/OAuthServer`,
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
    url: `${BASE_URL}/businesspartner/BSN`,
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
    url: `${BASE_URL}/businesspartner/KVK`,
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
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner`,
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
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerAddress`,
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
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber`,
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
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress`,
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
    url: `${BASE_URL}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM`,
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
    url: `${BASE_URL}/getDebtorInvoice/API_CV_ATTACHMENT_SRV/`,
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
    url: `${BASE_URL}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_CDS_TOA02`,
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
    url: `${BASE_URL}/Mandate/ZGW_FI_MANDATE_SRV_01/Mandate_readSet`,
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
    url: `${BASE_URL}/CreateMandate/ZGW_FI_MANDATE_SRV_01/Mandate_createSet`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const body = req.body;
            const lastMandate =
              eMandates.feed.entry[eMandates.feed.entry.length - 1];
            const lastID = lastMandate.content.properties.IMandateId;

            const newMandate = {
              ...lastMandate,
              content: {
                ...lastMandate.content,
                properties: {
                  ...lastMandate.content.properties,
                  ...body,
                  IMandateId: lastID + 1,
                },
              },
            };

            console.log('Creating new eMandate:', newMandate);

            eMandates.feed.entry.push(newMandate);

            return res.send(newMandate);
          },
        },
      },
    ],
  },
  {
    id: 'get-bank-account',
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerBank`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            return res.send({
              feed: {
                entry: [
                  {
                    content: {
                      '@type': 'application/xml',
                      properties: {
                        BusinessPartner: '0001500091',
                        BankIdentification: '0004',
                        BankCountryKey: 'NL',
                        BankName: 'BANKAMS',
                        BankNumber: 'BANKAMS',
                        SWIFTCode: 'BANKANL5',
                        BankAccountHolderName: 'I.M Mokum',
                        ValidityStartDate: new Date().toISOString(),
                        ValidityEndDate: '9999-12-31T23:59:59Z',
                        IBAN: 'NL35BOOG9343513650',
                        IBANValidityStartDate: new Date().toISOString(),
                        BankAccount: '9343513650',
                      },
                    },
                  },
                ],
              },
            });
          },
        },
      },
    ],
  },
  {
    id: 'post-bank-account',
    url: `${BASE_URL}/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerBank`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            return res.send('OK');
          },
        },
      },
    ],
  },
  {
    id: 'put-afis-emandates',
    url: `${BASE_URL}/ChangeMandate/ZGW_FI_MANDATE_SRV_01/:changeSetParam`,
    method: 'PUT',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware(req, res) {
            const body = req.body;
            const entryIndex = eMandates.feed.entry.findIndex(
              (eMandate) =>
                eMandate.content.properties.IMandateId.toString() ===
                body.IMandateId
            );
            const mandate = eMandates.feed.entry[entryIndex];

            if (!mandate) {
              return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).end();
            }

            const mandatePropertiesUpdated = {
              ...mandate.content.properties,
              ...body,
            };

            eMandates.feed.entry[entryIndex].content.properties =
              mandatePropertiesUpdated;

            return res.send(eMandates.feed.entry[entryIndex]);
          },
        },
      },
    ],
  },
];
