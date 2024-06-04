const ZORGNED_JZD_RESPONSE = require('../fixtures/zorgned-jzd.json');
const ZORGNED_AV_RESPONSE = require('../fixtures/zorgned-av.json');

module.exports = [
  {
    id: 'get-zorgned-jzd',
    url: '/api/remote/zorgned/aanvragen',
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZORGNED_JZD_RESPONSE,
        },
      },
    ],
  },
  {
    id: 'get-zorgned-av',
    url: '/api/remote/zorgned/persoonsgegevensNAW',
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: ZORGNED_AV_RESPONSE,
        },
      },
    ],
  },
];
