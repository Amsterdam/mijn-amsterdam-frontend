const settings = require('../settings.js');

module.exports = [
  {
    id: 'get-kvk',
    url: `${settings.MOCK_BASE_PATH}/hr_kvk`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'profile-type-handler',
        options: {
          privateUser: {
            status: 200,
            body: {},
          },
          commercialUser: {
            status: 200,
            body: {},
          },
        },
      },
    ],
  },
];
