import BSN_RESPONSE from '../fixtures/registraties-toeristische-verhuur-bsn.json' with { type: 'json' };
import NORMAL_RESPONSE from '../fixtures/registraties-toeristische-verhuur.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.js';

export default [
  {
    id: 'post-toeristische-verhuur-with-bsn',
    url: `${MOCK_BASE_PATH}/vakantieverhuur/bsn`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: BSN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-toeristische-verhuur-by-number',
    url: `${MOCK_BASE_PATH}/vakantieverhuur/:number`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, next) => {
            const { number } = req.params;
            return res.send({
              ...NORMAL_RESPONSE,
              registrationNumber: number,
            });
          },
        },
      },
    ],
  },
];
