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
    url: `${settings.MOCK_BASE_PATH}/gpass/rest/sales/v1/pas/:pasnummer`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            res.send({
              ...RESPONSES.STADSPAS,
              pasnummer: req.params.pasnummer,
              pasnummer_volledig: `volledig.${req.params.pasnummer}`,
              id: req.params.pasnummer,
            });
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
  {
    id: 'post-toggle-stadspas',
    url: `${settings.MOCK_BASE_PATH}/gpass/rest/sales/v1/togglepas/:pasnummer`,
    method: 'POST',
    // Add delay to make loading icon visibile in the front end when pressing the block button.
    // delay: 2500,
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            // return res.status(500).end();
            res.send({
              // NOT sure if this is the same response as the real API
              ...RESPONSES.STADSPAS,
              pasnummer: req.params.pasnummer,
              actief: false,
            });
          },
        },
      },
    ],
  },
];
