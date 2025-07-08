import BB_SEARCH_DOCUMENTS from '../fixtures/powerbrowser-bb-attachments.json' with { type: 'json' };
import BB_PERSONEN_ZAKEN from '../fixtures/powerbrowser-bb-personen-zaken.json' with { type: 'json' };
import BB_SEARCH_PERSON from '../fixtures/powerbrowser-bb-search-person.json' with { type: 'json' };
import BB_LINK_ZAAK_ADRES from '../fixtures/powerbrowser-bb-zaak-adres.json' with { type: 'json' };
import BB_ZAAK_STATUS from '../fixtures/powerbrowser-bb-zaak-status.json' with { type: 'json' };
import BB_ZAKEN from '../fixtures/powerbrowser-bb-zaken.json' with { type: 'json' };
import { MOCK_BASE_PATH, MOCK_DOCUMENT_PATH } from '../settings.js';

export default [
  {
    id: 'post-powerbrowser-token',
    url: `${MOCK_BASE_PATH}/powerbrowser/Token`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'text',
        options: {
          status: 200,
          body: 'xxxx-909090-yyyy',
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
            if (['MAATSCHAP', 'PERSONEN'].includes(req.body.query.tableName)) {
              return res.send(BB_SEARCH_PERSON);
            }

            return res.send(BB_SEARCH_DOCUMENTS);
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
          body: BB_ZAAK_STATUS,
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
        type: 'json',
        options: {
          status: 200,
          body: BB_ZAKEN,
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-personen-zaken',
    url: `${MOCK_BASE_PATH}/powerbrowser/Link/:type/GFO_ZAKEN/Table`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BB_PERSONEN_ZAKEN,
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
          body: BB_LINK_ZAAK_ADRES,
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
        type: 'file',
        options: {
          status: 200,
          path: MOCK_DOCUMENT_PATH,
        },
      },
    ],
  },
];
