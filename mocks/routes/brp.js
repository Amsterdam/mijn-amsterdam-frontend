import { constants as httpConstants } from 'node:http2';

import BRP_PERSONEN_OP_ADRES from '../fixtures/brp/personen-op-adres.json' with { type: 'json' };
// const BRP_PERSOONSGEGEVENS = require('../fixtures/brp/persoonsgegevens.json');
import BRP_PERSOONSGEGEVENS from '../fixtures/brp/test-personen.json' with { type: 'json' };
import BRP_VERBLIJFPLAATSHISTORIE from '../fixtures/brp/verblijfplaatshistorie.json' with { type: 'json' };
import BRP_RESPONSE from '../fixtures/brp.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

export default [
  {
    id: 'post-brp-persoonsgegevens',
    url: `${MOCK_BASE_PATH}/benk-brp/personen`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, _next, _core) => {
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
    url: `${MOCK_BASE_PATH}/benk-brp/verblijfplaatshistorie`,
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
    url: `${MOCK_BASE_PATH}/mks-koppel-api/brp/brp`,
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
    url: `${MOCK_BASE_PATH}/mks-koppel-api/brp/aantal_bewoners`,
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
