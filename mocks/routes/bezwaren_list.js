const BEZWAREN_LIST_RESPONSE = require('../fixtures/bezwaren.json');

module.exports = [
  {
    id: 'get-bezwaren-list',
    url: '/zgw/v1/zaken/_zoek',
    method: 'POST',
    delay: 2500,
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            statusCode: 200,
            body: BEZWAREN_LIST_RESPONSE,
          },
          commercialUser: {
            statusCode: 200,
            body: 'no-content',
          },
        },
      },
    ],
  },
];
