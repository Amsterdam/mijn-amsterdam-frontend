const BSN_RESPONSE = require('../fixtures/registraties-toeristische-verhuur-bsn.json');
const NORMAL_RESPONSE = require('../fixtures/registraties-toeristische-verhuur.json');

const A_NUMBER = 'AAAAAAAAAAAAAAAAAAAA';
const B_NUMBER = 'BBBBBBBBBBBBBBBBBBBB';

// RP TODO: Continue on first route (use hit_endpoints.sh) to test
module.exports = [
  {
    id: 'get-toeristische-verhuur-with-bsn',
    url: '/remote/vakantieverhuur/bsn',
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'middleware',
        options: {
          middleware: (req, res, next, core) => {
            core.logger.error(req.body);
            res.status(200);
            res.body(BSN_RESPONSE);
          },
          // status: 200,
          // body: BSN_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-toeristische-verhuur-with-a-number',
    url: `/remote/vakantieverhuur/${A_NUMBER}`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            ...NORMAL_RESPONSE,
            registrationNumber: A_NUMBER,
          },
        },
      },
    ],
  },
  {
    id: 'get-toeristische-verhuur-with-b-number',
    url: `/remote/vakantieverhuur/${B_NUMBER}`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            ...NORMAL_RESPONSE,
            registrationNumber: B_NUMBER,
          },
        },
      },
    ],
  },
];
