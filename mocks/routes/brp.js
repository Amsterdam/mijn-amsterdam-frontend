const BRP_RESPONSE = require('../fixtures/brp.json');

module.exports = [
  {
    id: 'get-brp',
    url: '/api/brp/brp',
    method: 'GET',
    delay: 2500,
    variants: [
      {
        id: 'standard',
        type: 'commercial-user-check',
        options: {
          code: 200,
          body: BRP_RESPONSE,
        },
      },
    ],
  },
];
