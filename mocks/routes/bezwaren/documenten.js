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
];
