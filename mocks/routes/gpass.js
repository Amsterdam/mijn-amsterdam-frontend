const settings = require('../settings');
const RESPONSES = {
  PASHOUDERS: require('../fixtures/gpass-pashouders.json'),
  STADSPAS: require('../fixtures/gpass-stadspas.json'),
  TRANSACTIES: require('../fixtures/gpass-transacties.json'),
};

const subPassen = RESPONSES.PASHOUDERS.sub_pashouders.flatMap(
  (pashouder) => pashouder.passen
);
const allPasses = RESPONSES.PASHOUDERS.passen.concat(subPassen);

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
          body: RESPONSES.PASHOUDERS,
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
            const correspondingPashouderPass = allPasses.find((pas) => {
              return pas.pasnummer == req.params.pasnummer;
            });
            res.send({
              // Because we want to be able to mutate a stadspas, We mutate a pashouder pas.
              // But RESPONSES.STADSPAS is static, so we overwrite this.
              ...correspondingPashouderPass,
              // ...RESPONSES.STADSPAS,
              budgetten: RESPONSES.STADSPAS.budgetten,
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
    delay: 2500,
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const pasnummer = req.params.pasnummer;
            const pas = allPasses.find((pas) => pas.pasnummer == pasnummer);

            // Mutate pas in memory to simulate a stateful API.
            pas.actief = !pas.actief;
            // Blocking a pass sets it `expiry_date` to now.
            pas.expiry_date = new Date().toString();

            res.send({
              ...RESPONSES.STADSPAS,
              pasnummer,
              expiry_date: pas.expiry_date,
              actief: pas.actief,
            });
          },
        },
      },
    ],
  },
];
