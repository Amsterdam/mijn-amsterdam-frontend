const BEZWAREN_LIST_RESPONSE = require('../../fixtures/bezwaren.json');

module.exports = [
  {
    id: 'get-bezwaren-list',
    url: '/zgw/v1/zaken/_zoek',
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
];
