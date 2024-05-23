const RESPONSES = {
  AANVRAGEN: require('../fixtures/wpi-aanvragen.json'),
  E_AANVRAGEN: require('../fixtures/wpi-e-aanvragen.json'),
  SPECIFICATIES: require('../fixtures/wpi-specificaties.json'),
};

module.exports = [
  {
    id: 'get-wpi-aanvragen',
    url: '/api/wpi/uitkering/aanvragen',
    method: 'GET',
    delay: 3400,
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: RESPONSES.AANVRAGEN,
          },
          commercialUser: {
            status: 200,
            body: 'no-content',
          },
        },
      },
    ],
  },
  {
    id: 'get-wpi-e-aanvragen',
    method: 'GET',
    url: '/api/wpi/e-aanvragen',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: RESPONSES.E_AANVRAGEN,
          },
          commercialUser: {
            status: 200,
            body: 'no-content',
          },
        },
      },
    ],
  },
  {
    id: 'get-wpi-specificaties',
    url: '/api/wpi/uitkering/specificaties-en-jaaropgaven',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: RESPONSES.SPECIFICATIES,
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
