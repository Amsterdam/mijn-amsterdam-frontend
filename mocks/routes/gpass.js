const RESPONSES = {
  PASHOUDER: require('../fixtures/gpass-pashouders.json'),
  STADSPAS: require('../fixtures/gpass-stadspas.json'),
  TRANSACTIES: require('../fixtures/gpass-transacties.json'),
};

module.exports = [
  {
    id: 'get-gpass-pashouders',
    url: '/remote/gpass/rest/sales/v1/pashouder',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: RESPONSES.PASHOUDER,
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
    id: 'get-gpass-stadspas',
    url: '/remote/gpass/rest/sales/v1/pas/*',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: RESPONSES.STADSPAS,
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
    id: 'get-gpass-transacties',
    url: '/remote/gpass/rest/transacties/v1/budget*',
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: RESPONSES.TRANSACTIES,
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
