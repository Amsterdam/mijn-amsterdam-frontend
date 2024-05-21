const ZORGNED_RESPONSE = require('../fixtures/zorgned.json');

module.exports = [
  {
    id: 'get-zorgned',
    url: '/api/remote/zorgned/*',
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            statusCode: 200,
            body: ZORGNED_RESPONSE,
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
