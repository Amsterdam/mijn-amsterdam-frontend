const settings = require('../settings');
const BSN_RESPONSE = require('../fixtures/registraties-toeristische-verhuur-bsn.json');
const NORMAL_RESPONSE = require('../fixtures/registraties-toeristische-verhuur.json');

module.exports = [
  {
    id: 'post-toeristische-verhuur-with-bsn',
    url: `${settings.MOCK_BASE_PATH}/vakantieverhuur/bsn`,
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
    url: `${settings.MOCK_BASE_PATH}/vakantieverhuur/:number`,
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
