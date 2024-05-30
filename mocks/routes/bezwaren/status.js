const BEZWAREN_STATUS_RESPONSE = require('../../fixtures/bezwaren-status.json');

module.exports = [
  {
    id: 'get-bezwaren-status',
    url: '/zgw/v1/statussen',
    method: 'GET',
    delay: 2500,
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: BEZWAREN_STATUS_RESPONSE,
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
