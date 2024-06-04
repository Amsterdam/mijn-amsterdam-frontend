const BRP_RESPONSE = require('../fixtures/brp.json');

module.exports = [
  {
    id: 'get-brp',
    url: '/api/brp/brp',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BRP_RESPONSE,
        },
      },
    ],
  },
];
