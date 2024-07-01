const settings = require('../settings');
const BSN_RESPONSE = require('../fixtures/registraties-toeristische-verhuur-bsn.json');
const NORMAL_RESPONSE = require('../fixtures/registraties-toeristische-verhuur.json');

const A_NUMBER = 'AAAAAAAAAAAAAAAAAAAA';
const B_NUMBER = 'BBBBBBBBBBBBBBBBBBBB';

module.exports = [
  {
    id: 'get-toeristische-verhuur-with-bsn',
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
    id: 'get-toeristische-verhuur-with-a-number',
    url: `${settings.MOCK_BASE_PATH}/vakantieverhuur/${A_NUMBER}`,
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
    url: `${settings.MOCK_BASE_PATH}/vakantieverhuur/${B_NUMBER}`,
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
