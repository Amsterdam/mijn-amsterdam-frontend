const settings = require('../settings');
const SVWI_RESPONSE = require('../fixtures/svwi.json');

// https://gemeente-amsterdam.atlassian.net/wiki/spaces/ma/pages/780927155/svwi+werk+en+inkomen (nog niet geimplementeerd?)
module.exports = [
  {
    id: 'get-svwi-tegel',
    url: `${settings.MOCK_BASE_PATH}/mijnamsterdam/v1/autorisatie/tegel`,
    method: 'get',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: SVWI_RESPONSE,
        },
      },
    ],
  },
];
