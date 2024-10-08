const settings = require('../settings');
const BB_ZAKEN = require('../fixtures/powerbrowser-bb-zaken.json');
const BB_ZAAK_STATUS = require('../fixtures/powerbrowser-bb-zaak-status.json');
const BB_PERSONEN_ZAKEN = require('../fixtures/powerbrowser-bb-personen-zaken.json');
const BB_SEARCH_PERSON = require('../fixtures/powerbrowser-bb-search-person.json');
const BB_ZAAK_ATTACHMENTS = require('../fixtures/powerbrowser-bb-attachments.json');

module.exports = [
  {
    id: 'post-powerbrowser-token',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Token`,
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
    id: 'post-powerbrowser-search-person',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/SearchRequest`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BB_SEARCH_PERSON,
        },
      },
    ],
  },
  {
    id: 'post-powerbrowser-zaak-status',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Report/RunSavedReport`,
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
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/record/GFO_ZAKEN/:zaakIds`,
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
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Link/PERSONEN/GFO_ZAKEN/Table`,
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
    id: 'get-powerbrowser-bb-zaak-attachments',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/link/GFO_ZAKEN/:zaaknummer`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BB_ZAAK_ATTACHMENTS,
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-bb-zaak-adres',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Record/AdresMbtZaakOrLocatie/GFO_ZAKEN/:zaaknummer`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'text',
        options: {
          status: 200,
          body: 'Dingemanstraat 12-H 1234AB Amsterdam',
        },
      },
    ],
  },
  {
    id: 'get-powerbrowser-bb-zaak-attachment-download',
    url: `${settings.MOCK_BASE_PATH}/powerbrowser/Dms/:id/Pdf`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'file',
        options: {
          status: 200,
          path: settings.MOCK_DOCUMENT_PATH,
        },
      },
    ],
  },
];
