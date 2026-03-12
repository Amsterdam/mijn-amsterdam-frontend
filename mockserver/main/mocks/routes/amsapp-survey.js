const survey = require('../fixtures/amsapp/survey.json');
const settings = require('../settings');

module.exports = [
  {
    id: 'get-amsapp-survey',
    url: `${settings.MOCK_BASE_PATH}/amsapp/survey/:id/versions/:version`,
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
  {
    id: 'get-amsapp-surveys',
    url: `${settings.MOCK_BASE_PATH}/amsapp/survey/entries`,
    method: 'GET',
    variants: [
      {
        id: 'standard',
        type: 'json',
        options: {
          status: 200,
          body: {
            count: 123,
            next: 'http://api.example.org/accounts/?page=4',
            previous: 'http://api.example.org/accounts/?page=2',
            results: [
              {
                id: 0,
                answers: [
                  {
                    question: 0,
                    answer: 'string',
                  },
                ],
                survey_unique_code: 'string',
                created_at: '2026-03-02T11:04:20.365Z',
                entry_point: 'string',
                metadata: 'string',
                survey_version: 0,
              },
            ],
          },
        },
      },
    ],
  },
];
