const BEZWAREN_DOCUMENTEN_RESPONSE = require('../fixtures/bezwaren-documents.json');

module.exports = [
  {
    id: 'get-bezwaren-documenten',
    url: '/zgw/v1/enkelvoudiginformatieobjecten',
    method: 'GET',
    delay: 2500,
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          code: 200,
          body: BEZWAREN_DOCUMENTEN_RESPONSE,
        },
      },
    ],
  },
];
