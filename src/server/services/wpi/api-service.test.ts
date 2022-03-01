import nock from 'nock';
import { BFF_PORT } from '../../config';
import {
  fetchBbz,
  fetchBijstandsuitkering,
  FetchConfig,
  fetchEAanvragen,
  fetchRequestProcess,
  fetchStadspas,
  fetchTonk,
  fetchTozo,
  fetchWpiNotifications,
} from './api-service';
import {
  WpiRequestProcess,
  WpiRequestProcessLabels,
  WpiRequestStatusLabels,
} from './wpi-types';

function fakeStepLabels(): WpiRequestStatusLabels {
  return {
    notification: {
      title: (requestProcess) => `Notification about ${requestProcess.about}.`,
      description: (requestProcess, statusStep) =>
        `Some body text for the ${requestProcess.about}/${statusStep.status} step.`,
      link: (requestProcess, statusStep) => ({
        to: `http://localhost/some/path/to/${requestProcess.id}/${statusStep.id}`,
        title: '',
      }),
    },
    description: (requestProcess, statusStep) =>
      statusStep.decision
        ? `Uw aanvraag is ${statusStep.decision || 'afgesloten'}`
        : `Some body text for the ${requestProcess.title}/${statusStep.status} step.`,
  };
}

describe('wpi/app-service', () => {
  let sessionID = '';
  let requestHeaders = {};

  const FakeRequestProcessLabels: WpiRequestProcessLabels = {
    begin: fakeStepLabels(),
    otherStep: fakeStepLabels(),
    finish: fakeStepLabels(),
  };

  test('fetchRequestProcess', async () => {
    const content: WpiRequestProcess[] = [
      {
        id: 'xxxxxxxfxaxkxex1xx',
        title: 'Fake request process',
        about: 'Fake WPI product',
        dateEnd: '2022-03-01T09:49',
        datePublished: '2022-03-01T09:49',
        dateStart: '2022-01-09T13:22',
        status: 'finish',
        decision: 'toekenning',
        steps: [
          {
            id: 'begin',
            status: 'Begin van aanvraagproces',
            datePublished: '2022-01-09T13:22',
            documents: [],
          },
          {
            id: 'otherStep',
            status: '2e stap in aanvraagproces',
            datePublished: '2022-02-13T06:10',
            documents: [],
          },
          {
            id: 'finish',
            status: 'Einde van aanvraagproces',
            datePublished: '2022-03-01T09:49',
            documents: [],
            decision: 'toekenning',
          },
        ],
      },
    ];

    nock(`http://localhost:${BFF_PORT}`)
      .get('/test-api/wpi/uitkering-en-stadspas/aanvragen')
      .reply(200, { content });

    const fetchConfig: FetchConfig = {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse: jest.fn((response) => {
        console.log('response!', response);
        return response.content;
      }),
      requestCacheKey: 'test-fetch-request-process',
    };

    const getLabelsMock = jest.fn(
      (requestProcess: WpiRequestProcess) => FakeRequestProcessLabels
    );

    const response = await fetchRequestProcess(
      sessionID,
      requestHeaders,
      getLabelsMock,
      fetchConfig
    );

    expect(response.status).toBe('OK');
    expect(response.content?.length).toBe(1);

    const [statusLine] = response.content || [];
    expect(statusLine.status).toBe('Einde van aanvraagproces');

    const [step1, step2, step3] = statusLine.steps;
    expect(step1.status).toBe('Begin van aanvraagproces');
    expect(step1.isChecked).toBe(true);
    expect(step1.isActive).toBe(false);

    expect(step2.isChecked).toBe(true);
    expect(step2.isActive).toBe(false);

    expect(step3.isChecked).toBe(true);
    expect(step3.isActive).toBe(true);
    expect(step3.description).toBe(`Uw aanvraag is toekenning`);
  });

  xtest('fetchBijstandsuitkering', () => {
    const result = fetchBijstandsuitkering(sessionID, requestHeaders);
  });

  xtest('fetchStadspas', () => {
    const result = fetchStadspas(sessionID, requestHeaders);
  });

  xtest('fetchEAanvragen', () => {
    const result = fetchEAanvragen(sessionID, requestHeaders);
  });

  xtest('fetchTozo', () => {
    const result = fetchTozo(sessionID, requestHeaders);
  });

  xtest('fetchBbz', () => {
    const result = fetchBbz(sessionID, requestHeaders);
  });

  xtest('fetchTonk', () => {
    const result = fetchTonk(sessionID, requestHeaders);
  });

  xtest('fetchWpiNotifications', () => {
    const result = fetchWpiNotifications(sessionID, requestHeaders);
  });
});
