const path = require('node:path');
const BEZWAREN_DOCUMENTEN_RESPONSE = require('../../fixtures/bezwaren-documents.json');

module.exports = [
  {
    id: 'get-bezwaren-documenten',
    url: '/zgw/v1/enkelvoudiginformatieobjecten',
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
    url: '/zgw/v1/enkelvoudiginformatieobjecten/:id/download',
    variants: [
      {
        id: 'standard',
        type: 'file',
        options: {
          status: 200,
          path: path.resolve('/mocks/fixtures/documents/document.pdf'),
        },
      },
    ],
  },
];
