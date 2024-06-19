const BELASTINGEN = require('../fixtures/belastingen.json');

module.exports = [
  {
    id: 'get-belastingen',
    url: '/remote/belastingen',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BELASTINGEN,
        },
      },
    ],
  },
];
