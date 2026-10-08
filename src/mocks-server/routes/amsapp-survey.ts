import survey from '../fixtures/amsapp/survey.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-amsapp-survey',
    url: `${MOCK_BASE_PATH}/amsapp/survey/:id/versions/:version`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: survey,
    },
  },
  {
    id: 'post-amsapp-survey-response',
    url: `${MOCK_BASE_PATH}/amsapp/survey/:id/versions/:version/entries`,
    method: 'POST',
    handler: {
      type: 'json',
      status: 200,
      body: { success: true },
    },
  },
  {
    id: 'get-amsapp-surveys',
    url: `${MOCK_BASE_PATH}/amsapp/survey/entries`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: {
        count: 4,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            answers: [
              {
                question: 2,
                answer:
                  'Ik kon mijn aanvraag makkelijk terugvinden. De status is duidelijk.',
              },
              {
                question: 3,
                answer: '5',
              },
              {
                question: 1,
                answer: 'noor.devries@example.com',
              },
            ],
            survey_unique_code: 'mams-inline-kto',
            created_at: '2026-01-21T11:20:25.203572+01:00',
            entry_point: '/inkomen/aanvragen',
            metadata: {
              browserTitle: 'Mijn aanvragen - Inkomen',
              maThemas: ['Inkomen', 'Mijn aanvragen'],
              maErrors: [
                {
                  name: 'AanvragenService',
                  error: 'De status kon niet direct worden bijgewerkt.',
                  stateKey: 'inkomen-aanvragen',
                },
              ],
              browserLanguage: 'nl-NL',
              browserTimezone: 'Europe/Amsterdam',
              browserScreenResolution: '1920x1080',
              maProfileType: 'private',
            },
            survey_version: 1,
          },
          {
            id: 2,
            answers: [
              {
                question: 1,
                answer: '',
              },
              {
                question: 3,
                answer: '2',
              },
              {
                question: 2,
                answer:
                  'Op mobiel liep ik vast bij het openen van de details. Een melding met uitleg zou helpen.',
              },
            ],
            survey_unique_code: 'mams-inline-kto',
            created_at: '2026-01-21T11:21:29.299760+01:00',
            entry_point: '/afval/afspraken',
            metadata: {
              browserTitle: 'Afvalafspraak maken',
              maThemas: ['Afval'],
              maErrors: [],
              browserLanguage: 'nl-NL',
              browserTimezone: 'Europe/Amsterdam',
              browserWindowInnerSize: '390x844',
              maProfileType: 'private',
            },
            survey_version: 1,
          },
          {
            id: 3,
            answers: [
              {
                question: 3,
                answer: '4',
              },
              {
                question: 1,
                answer: 'samir.bakker@example.com',
              },
            ],
            survey_unique_code: 'mams-inline-kto',
            created_at: '2026-01-22T09:04:12.000000+01:00',
            entry_point: '/belastingen/aanslag',
            metadata: {
              browserTitle: 'Aanslag bekijken - Belastingen',
              maThemas: ['Belastingen'],
              maErrors: [],
              browserLanguage: 'nl-NL',
              browserTimezone: 'Europe/Amsterdam',
              browserScreenResolution: '1440x900',
              maProfileType: 'commercial',
            },
            survey_version: 1,
          },
          {
            id: 4,
            answers: [
              {
                question: 2,
                answer:
                  'De informatie is helder, maar ik moest lang zoeken naar het contactformulier.',
              },
              {
                question: 1,
                answer: 'lisa.jansen@example.com',
              },
              {
                question: 3,
                answer: '3',
              },
            ],
            survey_unique_code: 'mams-inline-kto',
            created_at: '2026-01-22T10:37:48.000000+01:00',
            entry_point: '/contact',
            metadata: {
              browserTitle: 'Contact met de gemeente',
              maThemas: ['Contact'],
              maErrors: [
                {
                  name: 'Contactformulier',
                  error: 'Het formulier kon niet worden geladen.',
                  stateKey: 'contact-form',
                },
                {
                  name: 'DocumentenService',
                  error: 'Een document is tijdelijk niet beschikbaar.',
                  stateKey: 'contact-documenten',
                },
              ],
              browserLanguage: 'nl-NL',
              browserTimezone: 'Europe/Amsterdam',
              browserScreenResolution: '1366x768',
              maProfileType: 'private',
            },
            survey_version: 1,
          },
        ],
      },
    },
  },
];
