const settings = require('../settings');
const RESPONSES = {
  PASHOUDERS: require('../fixtures/gpass-pashouders.json'),
  STADSPAS: require('../fixtures/gpass-stadspas.json'),
  TRANSACTIES: require('../fixtures/gpass-transacties.json'),
};

function createPas({
  pasnummer = 1234567890,
  actief = true,
  vervangen = false,
  expiry_date = '2090-07-31T21:59:59.000Z',
}) {
  return {
    id: `123-${pasnummer}`,
    pasnummer: pasnummer,
    pasnummer_volledig: `60643660${pasnummer}`,
    categorie: 'Minima stadspas',
    categorie_code: 'M',
    actief,
    expiry_date,
    heeft_budget: true,
    vervangen,
    securitycode: '012346',
    passoort: {
      id: 11,
      naam: 'Digitale Stadspas',
    },
    budgetten: RESPONSES.STADSPAS.budgetten,
  };
}

function createSubPashouder({
  id = '03630000316910',
  voornaam = 'Jan',
  passen = [],
}) {
  const achternaam = `${voornaam}sma`;
  return {
    id,
    voornaam,
    initialen: voornaam[0],
    achternaam,
    volledige_naam: `${voornaam} ${achternaam}`,
    geslacht: 'M',
    geboortedatum: '1979-01-23T00:00:00.000Z',
    heeft_budget: true,
    passen,
  };
}

const thisYear = new Date().getFullYear();
const nextYear = thisYear + 1;
const expiryDateThisYear = `${thisYear}-07-31T00:00:00.000Z`;
const expiryDateNextYear = `${nextYear}-07-31T00:00:00.000Z`;

const pashoudersResponse = {
  ...RESPONSES.PASHOUDERS,
  passen: [
    createPas({
      pasnummer: 1234567891,
      expiry_date: expiryDateThisYear,
    }),
    createPas({
      pasnummer: 1234567892,
      expiry_date: expiryDateNextYear,
    }),
    createPas({
      pasnummer: 1234567893,
      actief: false,
      expiry_date: expiryDateThisYear,
    }),
    createPas({
      pasnummer: 1234567894,
      vervangen: true,
      actief: false,
      expiry_date: expiryDateThisYear,
    }),
  ],
  sub_pashouders: [
    createSubPashouder({
      id: '0363077880316910',
      voornaam: 'Mike',
      passen: [
        createPas({
          pasnummer: 1234567895,
          actief: false,
          vervangen: true,
          expiry_date: expiryDateThisYear,
        }),
        createPas({
          pasnummer: 1234567896,
          expiry_date: expiryDateThisYear,
        }),
        createPas({
          pasnummer: 1234567897,
          expiry_date: expiryDateNextYear,
        }),
      ],
    }),
  ],
};

const subPassen = pashoudersResponse.sub_pashouders.flatMap(
  (pashouder) => pashouder.passen
);
const allPasses = pashoudersResponse.passen.concat(subPassen);

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
          body: pashoudersResponse,
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
            pas.expiry_date = new Date().toISOString();

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
