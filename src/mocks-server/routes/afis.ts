import { constants as httpConstants } from 'node:http2';

import AFGEHANDELDE_FACTUREN from '../fixtures/afis/afgehandelde-facturen.json' with {
  type: 'json',
};
import AFGEHANDELDE_TERMIJN_FACTUREN from '../fixtures/afis/afgehandeldetermijn-facturen.json' with {
  type: 'json',
};
import ARC_DOC_ID from '../fixtures/afis/arc-doc-id.json' with { type: 'json' };
import BUSINESSPARTNERS from '../fixtures/afis/businesspartners.json' with {
  type: 'json',
};
import BUSINESSPARTNERS_KVK from '../fixtures/afis/businesspartners-kvk.json' with {
  type: 'json',
};
import DOCUMENT_RESPONSE from '../fixtures/afis/document.json' with {
  type: 'json',
};
import E_MANDATES from '../fixtures/afis/e-mandates.json' with { type: 'json' };
import OPENSTAANDE_FACTUREN from '../fixtures/afis/openstaande-facturen.json' with {
  type: 'json',
};
import OVERGEDRAGEN_FACTUREN from '../fixtures/afis/overgedragen-facturen.json' with {
  type: 'json',
};
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

type MandateEntry = {
  content: {
    properties: Record<string, unknown>;
  };
};

type MandatesResponse = {
  feed: {
    entry: MandateEntry[];
  };
};

type FacturenResponse = {
  feed: {
    entry: MandateEntry[];
    count?: number;
  };
};

const accountIds = [
  ...BUSINESSPARTNERS_KVK.Record.map((record) => record.Zakenpartnernummer),
  '0000067899',
];
const invoiceOwners = new Map<string, string>();
const mandateOwners = new Map<string, string>();

function normalizeBusinessPartnerId(value: unknown) {
  return String(value).replace(/^0+(?=\d)/, '');
}

function seedFacturen(response: FacturenResponse): FacturenResponse {
  const result = structuredClone(response);
  for (const entry of result.feed.entry) {
    const properties = entry.content.properties;
    const documentId = String(properties.AccountingDocument);
    if (!invoiceOwners.has(documentId)) {
      invoiceOwners.set(
        documentId,
        accountIds[invoiceOwners.size % accountIds.length]
      );
    }
    const accountId = invoiceOwners.get(documentId)!;
    properties.Customer = accountId;
    if (
      typeof properties.SEPAMandate === 'string' ||
      typeof properties.SEPAMandate === 'number'
    ) {
      mandateOwners.set(
        normalizeBusinessPartnerId(properties.SEPAMandate),
        accountId
      );
    }
  }
  return result;
}

const facturenByState: Record<string, FacturenResponse> = {
  openstaande: seedFacturen(OPENSTAANDE_FACTUREN as FacturenResponse),
  afgehandelde: seedFacturen(AFGEHANDELDE_FACTUREN as FacturenResponse),
  afgehandeldetermijn: seedFacturen(
    AFGEHANDELDE_TERMIJN_FACTUREN as FacturenResponse
  ),
  overgedragen: seedFacturen(OVERGEDRAGEN_FACTUREN as FacturenResponse),
};

const eMandates = structuredClone(E_MANDATES) as MandatesResponse;
for (const [index, entry] of eMandates.feed.entry.entries()) {
  const properties = entry.content.properties;
  properties.SndId =
    mandateOwners.get(normalizeBusinessPartnerId(properties.IMandateId)) ??
    accountIds[index % accountIds.length];
}

const BASE = '/afis';
const REST_BASE = `${BASE}/RESTAdapter`;
const BASE_URL = `${MOCK_BASE_PATH}${REST_BASE}`;

function queryValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === 'string').join(' ');
  }

  return typeof value === 'string' ? value : '';
}

function businessPartnerFromFilter(
  value: unknown,
  field: 'Customer' | 'SndId'
) {
  const match = queryValue(value).match(
    new RegExp(`(?:^|\\s|\\()${field}\\s+eq\\s+'(\\d+)'(?=\\s|\\)|$)`)
  );
  return match ? normalizeBusinessPartnerId(match[1]) : null;
}

export const routes: MockRouteDefinition[] = [
  {
    id: 'post-afis-auth-token',
    url: `${BASE_URL}/OAuthServer`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: {
        access_token: '123xyz',
        token_type: 'bearer',
        expires_in: 3600,
      },
    },
  },
  {
    id: 'post-afis-businesspartner-bsn',
    url: `${BASE_URL}/businesspartner/BSN`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: {
        BSN: 999999999,
        Zakenpartnernummer: '67899',
        Blokkade: 'Nee',
        Afnemers_indicatie: 'Nee',
        Gevonden: 'Ja',
      },
    },
  },
  {
    id: 'post-afis-businesspartner-kvk',
    url: `${BASE_URL}/businesspartner/KVK`,
    method: 'POST',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const body = req.body as {
          KVK?: string | number;
          Vestigingsnummer?: string;
        };
        const records = BUSINESSPARTNERS_KVK.Record.filter(
          (record) =>
            String(record.KVK) === String(body.KVK) &&
            (!body.Vestigingsnummer ||
              ('Vestigingsnummer' in record &&
                record.Vestigingsnummer === body.Vestigingsnummer))
        );
        return res.send({ Record: records });
      },
    },
  },
  {
    id: 'get-afis-businesspartner-details',
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartner`,
    method: 'GET',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const businessPartnerId =
          queryValue(req.query.$filter)
            .match(/^BusinessPartner\s+eq\s+'(\d+)'$/)?.[1]
            .replace(/^0+/, '') || null;
        const entry = BUSINESSPARTNERS.feed.entry.filter(
          (partner) =>
            String(partner.content.properties.BusinessPartner).replace(
              /^0+/,
              ''
            ) === businessPartnerId
        );
        return res.send({ feed: { entry } });
      },
    },
  },
  {
    id: 'get-afis-businesspartner-address',
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerAddress`,
    method: 'GET',
    handler: {
      type: 'json',
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
  {
    id: 'get-afis-businesspartner-phonenumber',
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressPhoneNumber`,
    method: 'GET',
    handler: {
      type: 'json',
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
  {
    id: 'get-afis-businesspartner-emailaddress',
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_AddressEmailAddress`,
    method: 'GET',
    handler: {
      type: 'json',
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
  {
    id: 'get-afis-facturen',
    url: `${BASE_URL}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_OPERACCTGDOCITEM`,
    method: 'GET',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const stateFilters = [
          { state: 'openstaande', filter: 'IsCleared eq false' },
          {
            state: 'afgehandeldetermijn',
            filter: `and PaymentTerms gt 'B' and SEPAMandate ne '' `,
          },
          {
            state: 'afgehandelde',
            filter: `DunningLevel ne '3' or ReverseDocument ne ''`,
          },
          { state: 'overgedragen', filter: `DunningLevel eq '3'` },
        ] as const;

        const filterQuery = queryValue(req.query?.$filter);
        const stateName = stateFilters.find(({ filter }) =>
          filterQuery.includes(filter)
        )?.state;

        if (!stateName) {
          return res.status(httpConstants.HTTP_STATUS_FORBIDDEN).end();
        }

        const customer = businessPartnerFromFilter(filterQuery, 'Customer');
        const includedDocuments = Array.from(
          filterQuery.matchAll(/AccountingDocument eq '([^']+)'/g),
          (match) => match[1]
        );
        const excludedDocuments = Array.from(
          filterQuery.matchAll(/AccountingDocument ne '([^']+)'/g),
          (match) => match[1]
        );
        let feedEntries = facturenByState[stateName].feed.entry.filter(
          (entry) => {
            const properties = entry.content.properties;
            const documentId = String(properties.AccountingDocument);
            return (
              normalizeBusinessPartnerId(properties.Customer) === customer &&
              (!includedDocuments.length ||
                includedDocuments.includes(documentId)) &&
              !excludedDocuments.includes(documentId) &&
              (!filterQuery.includes("InvoiceReference ne ''") ||
                (typeof properties.InvoiceReference === 'string' &&
                  properties.InvoiceReference !== ''))
            );
          }
        );
        const count = feedEntries.length;

        const topValue = Number(queryValue(req.query?.$top));
        if (!Number.isNaN(topValue) && topValue > 0) {
          feedEntries = feedEntries.slice(0, topValue);
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
  {
    id: 'post-afis-factuur-download',
    url: `${BASE_URL}/getDebtorInvoice/API_CV_ATTACHMENT_SRV/`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: DOCUMENT_RESPONSE,
    },
  },
  {
    id: 'get-afis-factuur-document-id',
    url: `${BASE_URL}/API/ZFI_OPERACCTGDOCITEM_CDS/ZFI_CDS_TOA02`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: ARC_DOC_ID,
    },
  },
  {
    id: 'get-afis-paylink',
    url: `${MOCK_BASE_PATH}/afis/paylink`,
    method: 'GET',
    handler: {
      type: 'middleware',
      middleware: (_req, res) => {
        return res.send(
          '<h1>Afis factuur betalen</h1><button onclick="history.back()">Betaal factuur</button>'
        );
      },
    },
  },
  {
    id: 'get-afis-emandates',
    url: `${BASE_URL}/Mandate/ZGW_FI_MANDATE_SRV_01/Mandate_readSet`,
    method: 'GET',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const senderId = businessPartnerFromFilter(req.query.$filter, 'SndId');
        const entry = eMandates.feed.entry.filter(
          (mandate) =>
            normalizeBusinessPartnerId(mandate.content.properties.SndId) ===
            senderId
        );
        return res.send({ feed: { entry, count: entry.length } });
      },
    },
  },
  {
    id: 'post-afis-emandates',
    url: `${BASE_URL}/CreateMandate/ZGW_FI_MANDATE_SRV_01/Mandate_createSet`,
    method: 'POST',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const body = req.body as Record<string, unknown>;
        const lastMandate =
          eMandates.feed.entry[eMandates.feed.entry.length - 1];
        const lastId = Math.max(
          ...eMandates.feed.entry.map((mandate) =>
            Number(mandate.content.properties.IMandateId)
          )
        );
        const existingMandate = eMandates.feed.entry.find(
          (mandate) =>
            normalizeBusinessPartnerId(mandate.content.properties.SndId) ===
              normalizeBusinessPartnerId(body.SndId) &&
            String(mandate.content.properties.SndDebtorId) ===
              String(body.SndDebtorId)
        );

        const mandateBase = existingMandate ?? lastMandate;

        const mandate: MandateEntry = {
          ...mandateBase,
          content: {
            ...mandateBase.content,
            properties: {
              ...mandateBase.content.properties,
              ...body,
              IMandateId: String(lastId + 1),
              Status: '1',
            },
          },
        };

        eMandates.feed.entry.push(mandate);

        return res.send(mandate);
      },
    },
  },
  {
    id: 'get-bank-account',
    url: `${BASE_URL}/API/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerBank`,
    method: 'GET',
    handler: {
      type: 'middleware',
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
  {
    id: 'post-bank-account',
    url: `${BASE_URL}/ZAPI_BUSINESS_PARTNER_DET_SRV/A_BusinessPartnerBank`,
    method: 'POST',
    handler: {
      type: 'middleware',
      middleware: (_req, res) => {
        return res.send('OK');
      },
    },
  },
  {
    id: 'put-afis-emandates',
    url: `${BASE_URL}/ChangeMandate/ZGW_FI_MANDATE_SRV_01/:changeSetParam`,
    method: 'PUT',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const body = req.body as Record<string, unknown>;
        const entryIndex = eMandates.feed.entry.findIndex(
          (mandate) =>
            String(mandate.content.properties.IMandateId) ===
            String(body.IMandateId)
        );

        const mandate = eMandates.feed.entry[entryIndex];
        if (!mandate) {
          return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).end();
        }

        eMandates.feed.entry[entryIndex].content.properties = {
          ...mandate.content.properties,
          ...body,
        };

        return res.send(eMandates.feed.entry[entryIndex]);
      },
    },
  },
];
