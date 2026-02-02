const survey = require('../fixtures/amsapp/survey.json');
const settings = require('../settings');

module.exports = [
  {
    id: 'get-amsapp-survey',
    url: `${settings.MOCK_BASE_PATH}/amsapp/survey/:id/latest`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: survey,
        },
      },
    ],
  },
  {
    id: 'post-amsapp-survey-response',
    url: `${settings.MOCK_BASE_PATH}/amsapp/survey/:id/versions/:version/entries`,
    method: 'POST',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: { success: true },
        },
      },
    ],
  },
];
