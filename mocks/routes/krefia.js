const KREFIA_RESPONSE = require('../fixtures/krefia.json');

module.exports = [
  {
    id: 'get-krefia',
    url: '/api/krefia/all',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: KREFIA_RESPONSE,
        },
      },
    ],
  },
];
