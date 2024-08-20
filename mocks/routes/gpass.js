const UID = require('uid-safe');
const settings = require('../settings');
const RESPONSES = {
  PASHOUDER: require('../fixtures/gpass-pashouders.json'),
  STADSPAS: require('../fixtures/gpass-stadspas.json'),
  TRANSACTIES: require('../fixtures/gpass-transacties.json'),
};

module.exports = [
  {
    id: 'get-gpass-pashouders',
    url: `${settings.MOCK_BASE_PATH}/gpass/rest/sales/v1/pashouder`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: RESPONSES.PASHOUDER,
        },
      },
    ],
  },
  {
    id: 'get-gpass-stadspas',
    url: `${settings.MOCK_BASE_PATH}/gpass/rest/sales/v1/pas/*`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware(req, res, next) {
            return res.send(
              Object.assign(RESPONSES.STADSPAS, {
                id: `stadspas-${UID.sync(18)}`,
              })
            );
          },
        },
      },
    ],
  },
  {
    id: 'get-gpass-transacties',
    url: `${settings.MOCK_BASE_PATH}/gpass/rest/transacties/v1/budget*`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: RESPONSES.TRANSACTIES,
        },
      },
    ],
  },
  {
    id: 'get-gpass-aanbiedingen-transacties',
    url: `${settings.MOCK_BASE_PATH}/gpass/rest/transacties/v1/aanbiedingen*`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: [{ toBeDeterminedFields: 'Unknown' }],
        },
      },
    ],
  },
];
