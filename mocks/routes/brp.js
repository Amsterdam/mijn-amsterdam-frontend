const BRP_PERSONEN_OP_ADRES = require('../fixtures/brp/personen-op-adres.json');
const BRP_PERSOONSGEGEVENS = require('../fixtures/brp/test-personen.json');
const BRP_VERBLIJFPLAATSHISTORIE = require('../fixtures/brp/verblijfplaatshistorie.json');
const settings = require('../settings.js');

const httpConstants = require('http2').constants;

module.exports = [
  {
    id: 'post-brp-persoonsgegevens',
    url: `${settings.MOCK_BASE_PATH}/benk-brp/personen`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res) => {
            const { type, burgerservicenummer } = req.body;

            const persoonsgegevens = BRP_PERSOONSGEGEVENS.personen.filter(
              (persoon) =>
                burgerservicenummer.includes(persoon.burgerservicenummer)
            );

            switch (type) {
              case 'RaadpleegMetBurgerservicenummer':
                return res.send({
                  ...BRP_PERSOONSGEGEVENS,
                  personen: persoonsgegevens,
                });
              case 'ZoekMetAdresseerbaarObjectIdentificatie':
                return res.send(BRP_PERSONEN_OP_ADRES);
              default:
                return res.status(httpConstants.HTTP_STATUS_UNAUTHORIZED).send({
                  message: 'Niet geauthoriseerd verzoek',
                });
            }
          },
        },
      },
    ],
  },
  {
    id: 'post-brp-verblijfplaatshistorie',
    url: `${settings.MOCK_BASE_PATH}/benk-brp/verblijfplaatshistorie`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BRP_VERBLIJFPLAATSHISTORIE,
        },
      },
    ],
  },
  {
    id: 'post-brp-aantal-bewoners',
    url: `${settings.MOCK_BASE_PATH}/mks-koppel-api/brp/aantal_bewoners`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            content: { residentCount: Math.round(Math.random() * 6) },
            status: 'OK',
          },
        },
      },
    ],
  },
];
