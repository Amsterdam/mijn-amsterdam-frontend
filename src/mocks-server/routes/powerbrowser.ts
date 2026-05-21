import PB_SEARCH_DOCUMENTS from '../fixtures/powerbrowser-attachments.json' with { type: 'json' };
import PB_PERSONEN_ZAKEN from '../fixtures/powerbrowser-personen-zaken.json' with { type: 'json' };
import PB_SEARCH_PERSON from '../fixtures/powerbrowser-search-person.json' with { type: 'json' };
import PB_LINK_ZAAK_ADRES from '../fixtures/powerbrowser-zaak-adres.json' with { type: 'json' };
import PB_ZAAK_STATUS from '../fixtures/powerbrowser-zaak-status.json' with { type: 'json' };
import PB_ZAAK_WBTRANSPORT from '../fixtures/powerbrowser-zaak-wbtransport.json' with { type: 'json' };
import { sendMockDocument } from '../helpers/send-mock-document.ts';
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

type SearchCondition = {
  fieldName: string;
  fieldValue: string;
};

type SearchRequestBody = {
  query?: {
    tableName?: string;
    conditions?: SearchCondition[];
  };
};

type SearchRecord = {
  fmtCpn: string;
  fields: Array<Record<string, unknown>>;
  forTestingZaakIds?: string[];
};

const PB_SEARCH_DOCUMENTS_TYPED = PB_SEARCH_DOCUMENTS as {
  mainTableName: string;
  records: SearchRecord[];
};

const PB_SEARCH_DOCUMENTS_PROCESSED = {
  mainTableName: PB_SEARCH_DOCUMENTS_TYPED.mainTableName,
  records: PB_SEARCH_DOCUMENTS_TYPED.records.map((record) => {
    const minimumValidRecord = [
      {
        fieldName: 'STAMCSSTATUS_ID',
        text: 'definitief',
        fieldValue: '1000001002',
      },
      {
        fieldName: 'SOORTDOCUMENT_ID',
        fieldValue: record.fmtCpn.toLowerCase().includes('besluit')
          ? '256'
          : '1000001015',
      },
    ];

    return {
      ...record,
      fields: [...minimumValidRecord, ...record.fields],
    };
  }),
};

export const routes: MockRouteDefinition[] = [
  {
    id: 'post-powerbrowser-token',
    url: `${MOCK_BASE_PATH}/powerbrowser/Token`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            return res.status(200).send('xxxx-909090-yyyy');
          },
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-search-requests',
    url: `${MOCK_BASE_PATH}/powerbrowser/SearchRequest`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const body = req.body as SearchRequestBody;
            const tableName = body.query?.tableName;

            if (tableName === 'MAATSCHAP' || tableName === 'PERSONEN') {
              return res.status(200).send(PB_SEARCH_PERSON);
            }

            const conditions = body.query?.conditions ?? [];

            return res.status(200).send({
              mainTableName: PB_SEARCH_DOCUMENTS_PROCESSED.mainTableName,
              records: PB_SEARCH_DOCUMENTS_PROCESSED.records.filter((record) =>
                conditions.some(
                  (condition) =>
                    condition.fieldName === 'GFO_ZAKEN_ID' &&
                    record.forTestingZaakIds?.includes(condition.fieldValue)
                )
              ),
            });
          },
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-zaak-status',
    url: `${MOCK_BASE_PATH}/powerbrowser/Report/RunSavedReport`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: PB_ZAAK_STATUS,
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-zaken',
    url: `${MOCK_BASE_PATH}/powerbrowser/record/GFO_ZAKEN/:zaakIds`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const zaakIds = req.params.zaakIds.split(',');

            return res
              .status(200)
              .send(
                PB_PERSONEN_ZAKEN.filter((zaak) => zaakIds.includes(zaak.id))
              );
          },
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-personen-zaken',
    url: `${MOCK_BASE_PATH}/powerbrowser/Link/:type/GFO_ZAKEN/`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: PB_PERSONEN_ZAKEN,
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-bb-zaak-adres',
    url: `${MOCK_BASE_PATH}/powerbrowser/Link/GFO_ZAKEN/ADRESSEN/Table`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: PB_LINK_ZAAK_ADRES,
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-bb-zaak-wb-transport',
    url: `${MOCK_BASE_PATH}/powerbrowser/Link/GFO_ZAKEN/WB_TRANSPORT/Table`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: PB_ZAAK_WBTRANSPORT,
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-bb-zaak-attachment-download',
    url: `${MOCK_BASE_PATH}/powerbrowser/Dms/:id/Pdf`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (_req, res) => {
            sendMockDocument(res, 200);
          },
        },
      },
    ],
  },
];
