const BEZWAREN_STATUS_RESPONSE = require('../../fixtures/bezwaren-status.json');

module.exports = [
  {
    id: 'get-bezwaren-status',
    url: '/zgw/v1/statussen',
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
