const BEZWAREN_LIST_RESPONSE = require('../../fixtures/bezwaren.json');

module.exports = [
  {
    id: 'get-bezwaren-list',
    url: '/zgw/v1/zaken/_zoek',
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: BEZWAREN_LIST_RESPONSE,
          },
          commercialUser: {
            status: 200,
            body: 'no-content',
          },
        },
      },
    ],
  },
];
