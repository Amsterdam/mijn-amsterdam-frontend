const WMO_RESPONSE = require('../fixtures/wmo.json');

module.exports = [
  {
    id: 'get-wmo',
    url: '/remote/zorgned/', //TODO: Wildcard na url?
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          code: 200,
          body: WMO_RESPONSE,
        },
      },
    ],
  },
];
