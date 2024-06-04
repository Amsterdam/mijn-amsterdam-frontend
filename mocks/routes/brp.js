const BRP_RESPONSE = require('../fixtures/brp.json');

module.exports = [
  {
    id: 'get-brp',
    url: '/api/brp/brp',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: BRP_RESPONSE,
          },
          commercialUser: {
            status: 200,
            // RP TODO: alle no content vervangen met de normale response body
            body: 'no-content',
          },
        },
      },
    ],
  },
];
