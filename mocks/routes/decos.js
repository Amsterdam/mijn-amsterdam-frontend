const settings = require('../settings.js');

const ADDRESS_BOOKS = require('../fixtures/decos-vergunningen-addressbook-response.json');
const DOCUMENTS_LIST = require('../fixtures/decos-vergunningen-documents-list-response.json');
const WORKFLOW_INSTANCES = require('../fixtures/decos-vergunningen-workflowinstances-response.json');
const WORKFLOWS = require('../fixtures/decos-vergunningen-workflows-response.json');
const ZAAK_DETAIL = require('../fixtures/decos-vergunningen-zaakdetail-response.json');
const ZAKEN = require('../fixtures/decos-vergunningen-zaken-response.json');

module.exports = [
  {
    id: 'post-decos-address-books',
    url: `${settings.MOCK_BASE_PATH}/decos/search/books`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ADDRESS_BOOKS,
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-detail',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZAAK_DETAIL,
        },
      },
    ],
  },
  {
    id: 'get-decos-zaken',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/folders`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZAKEN,
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-documents',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/documents`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: DOCUMENTS_LIST,
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-workflows',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/workflows`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: WORKFLOWS,
        },
      },
    ],
  },
  {
    id: 'get-decos-zaak-workflowdetails',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/workflowlinkinstances`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: WORKFLOW_INSTANCES,
        },
      },
    ],
  },
  {
    id: 'get-decos-document-download',
    url: `${settings.MOCK_BASE_PATH}/decos/items/:key/content`,
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
