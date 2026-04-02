const survey = require('../fixtures/amsapp/survey.json');
const settings = require('../settings.cjs');

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
            count: 2,
            next: null,
            previous: null,
            results: [
              {
                id: 1,
                answers: [
                  {
                    question: 1,
                    answer: 'string',
                  },
                ],
                survey_unique_code: 'mams-inline-kto',
                created_at: '2026-01-21T11:20:25.203572+01:00',
                entry_point: 'string',
                metadata: {
                  foo: 'bar',
                },
                survey_version: 1,
              },
              {
                id: 2,
                answers: [
                  {
                    question: 1,
                    answer: 'string',
                  },
                ],
                survey_unique_code: 'mams-inline-kto',
                created_at: '2026-01-21T11:21:29.299760+01:00',
                entry_point: '/inkomen',
                metadata: {
                  'browser.title': 'inkomen',
                },
                survey_version: 1,
              },
            ],
          },
        },
      },
    ],
  },
];
