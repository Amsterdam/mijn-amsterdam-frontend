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
        type: 'json',
        options: {
          status: 200,
          body: RESPONSES.STADSPAS,
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
  {
    id: 'post-toggle-stadspas',
    url: `${settings.MOCK_BASE_PATH}/gpass/rest/sales/v1/togglepas/:pasId`,
    method: 'POST',
    // Add delay to make loading icon visibile in the front end when pressing the block button.
    delay: 2500,
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            id: 999999,
            pasnummer: 6099999999999,
            pasnummer_volledig: '6064366099999999999',
            categorie: 'Minima stadspas',
            categorie_code: 'M',
            expiry_date: '2025-01-07T15:55:10.796Z',
            actief: false,
            budgetten_actief: true,
            heeft_budget: true,
            vervangen: false,
            passoort: { id: 99, naam: 'Digitale Stadspas' },
            originele_pas: {
              id: 999999,
              pasnummer: 6099999999999,
              pasnummer_volledig: '6064366099999999999',
              categorie: 'Minima stadspas',
              categorie_code: 'M',
              passoort: { id: 99, naam: 'Digitale Stadspas' },
            },
            budgetten: [],
          },
        },
      },
    ],
  },
];
