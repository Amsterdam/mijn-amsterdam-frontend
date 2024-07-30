const settings = require('../settings');

module.exports = [
  {
    id: 'post-amsapp-administratienummer',
    url: `${settings.MOCK_BASE_PATH}/amsapp/administratienummer`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { detail: 'Success' },
        },
      },
    ],
  },
];
