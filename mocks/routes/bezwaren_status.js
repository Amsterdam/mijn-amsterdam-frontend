const BEZWAREN_STATUS_RESPONSE = require('../fixtures/bezwaren-status.json');

// TODO: Hulp hierbij krijgen. URL in evn is HTTPS en error heeft met SSL te maken
module.exports = [
  {
    id: 'get-bezwaren-status',
    url: '/zgw/v1/statussen',
    method: 'POST',
    delay: 2500,
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          code: 200,
          body: BEZWAREN_STATUS_RESPONSE,
        },
      },
    ],
  },
];
