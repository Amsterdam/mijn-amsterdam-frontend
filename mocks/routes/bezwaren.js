const settings = require('../settings.js');

const BEZWAREN_STATUS_RESPONSE = require('../fixtures/bezwaren-status.json');
const BEZWAREN_LIST_RESPONSE = require('../fixtures/bezwaren.json');
const BEZWAREN_DOCUMENTEN_RESPONSE = require('../fixtures/bezwaren-documents.json');

module.exports = [
  {
    id: 'post-bezwaren-list',
    url: `${settings.MOCK_BASE_PATH}/bezwaren/zgw/v1/zaken/_zoek`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BEZWAREN_LIST_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-bezwaren-documenten',
    url: `${settings.MOCK_BASE_PATH}/bezwaren/zgw/v1/enkelvoudiginformatieobjecten`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BEZWAREN_DOCUMENTEN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-bezwaren-download-document',
    url: `${settings.MOCK_BASE_PATH}/bezwaren/zgw/v1/enkelvoudiginformatieobjecten/:id/download`,
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
  {
    id: 'get-bezwaren-status',
    url: `${settings.MOCK_BASE_PATH}/bezwaren/zgw/v1/statussen`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BEZWAREN_STATUS_RESPONSE,
        },
      },
    ],
  },
];
