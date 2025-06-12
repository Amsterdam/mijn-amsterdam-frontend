const BRP_PERSONEN_OP_ADRES = require('../fixtures/brp/personen-op-adres.json');
const BRP_PERSOONSGEGEVENS = require('../fixtures/brp/persoonsgegevens.json');
const BRP_VERBLIJFPLAATSHISTORIE = require('../fixtures/brp/verblijfplaatshistorie.json');
const BRP_RESPONSE = require('../fixtures/brp.json');
const settings = require('../settings.js');

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
          middleware: (req, res, next, core) => {
            const { type } = req.body;

            return res.send(
              type === 'RaadpleegMetBurgerservicenummer'
                ? BRP_PERSOONSGEGEVENS
                : BRP_PERSONEN_OP_ADRES
            );
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
  // Legacy MKS / Koppel API endpoints
  {
    id: 'get-brp',
    url: `${settings.MOCK_BASE_PATH}/mks-koppel-api/brp/brp`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BRP_RESPONSE,
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
