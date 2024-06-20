const settings = require('../../settings.js');
const loadFixture = require('../../loadFixture.js');

const BEZWAREN_DOCUMENTEN_RESPONSE = loadFixture('bezwaren-documents.json');

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
          path: settings.MOCK_DOCUMENT_PATH,
        },
      },
    ],
  },
];
