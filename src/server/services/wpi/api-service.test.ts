import nock from 'nock';
import { ApiErrorResponse, jsonCopy } from '../../../universal/helpers';
import { BFF_PORT } from '../../config';
import {
  fetchBijstandsuitkering,
  FetchConfig,
  fetchRequestProcess,
  fetchStadspas,
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

  afterAll(() => {
    nock.enableNetConnect();
    nock.restore();
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('fetchRequestProcess', async () => {
    nock(`http://localhost:${BFF_PORT}`)
      .get('/test-api/wpi/uitkering-en-stadspas/aanvragen')
      .reply(200, { content });

    const fetchConfig: FetchConfig = {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse: jest.fn((response) => response.content),
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

  test('fetchRequestProcess-with-error', async () => {
    nock(`http://localhost:${BFF_PORT}`)
      .get('/test-api/wpi/uitkering-en-stadspas/aanvragen')
      .reply(500, { content: null });

    const fetchConfig: FetchConfig = {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse: jest.fn((response) => response.content),
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

    expect(response.status).toBe('ERROR');
    expect((response as ApiErrorResponse<any>).message).toBe(
      'Error: Request failed with status code 500'
    );
  });

  test('fetchBijstandsuitkering', async () => {
    const contentBijstandsuitkering = jsonCopy(content[0]);

    contentBijstandsuitkering.about = 'Bijstandsuitkering';
    contentBijstandsuitkering.status = 'herstelTermijn';
    contentBijstandsuitkering.decision = null;

    delete contentBijstandsuitkering.steps[2].decision;

    contentBijstandsuitkering.steps[0].id = 'aanvraag';
    contentBijstandsuitkering.steps[0].status = 'Aanvraag';

    contentBijstandsuitkering.steps[1].id = 'inBehandeling';
    contentBijstandsuitkering.steps[1].status = 'In behandeling';

    contentBijstandsuitkering.steps[2].id = 'herstelTermijn';
    contentBijstandsuitkering.steps[2].status = 'Meer informatie';
    contentBijstandsuitkering.steps[2].dateDecisionExpected =
      '2022-05-15T15:05:52+02:00';
    contentBijstandsuitkering.steps[2].dateUserFeedbackExpected =
      '2022-04-27T15:05:52+02:00';

    nock(`http://localhost:${BFF_PORT}`)
      .get('/test-api/wpi/uitkering-en-stadspas/aanvragen')
      .reply(200, {
        content: [contentBijstandsuitkering, { about: 'Stadspas' }, null],
      });

    const response = await fetchBijstandsuitkering(sessionID, requestHeaders);

    expect(response.status).toBe('OK');
    expect(response.content?.length).toBe(1);

    const [statusLine] = response.content || [];
    expect(statusLine.status).toBe('Meer informatie');

    const [step1, step2, step3] = statusLine.steps;
    expect(step1.status).toBe('Aanvraag');
    expect(step1.isChecked).toBe(true);
    expect(step1.isActive).toBe(false);

    expect(step2.status).toBe('In behandeling');
    expect(step2.isChecked).toBe(true);
    expect(step2.isActive).toBe(false);

    expect(step3.status).toBe('Meer informatie');
    expect(step3.isChecked).toBe(true);
    expect(step3.isActive).toBe(true);
    expect(step3.description).toMatchInlineSnapshot(`
      "
                <p>
                  Wij hebben meer informatie en tijd nodig om uw aanvraag te
                  verwerken. Bekijk de brief voor meer details. U moet de extra
                  informatie vóór 27 april 2022 opsturen. Dan ontvangt u
                  vóór 15 mei 2022 ons besluit.
                </p>
                <p>
                  Tip: Lever de informatie die wij gevraagd hebben zo spoedig mogelijk
                  in. Hoe eerder u ons de noodzakelijke informatie geeft, hoe eerder
                  wij verder kunnen met de behandeling van uw aanvraag.
                </p>
              "
    `);
  });

  test('fetchStadspas', async () => {
    const contentBijstandsuitkering = jsonCopy(content[0]);
    contentBijstandsuitkering.about = 'Bijstandsuitkering';

    const contentStadspas = jsonCopy(content[0]);
    contentStadspas.about = 'Stadspas';

    contentStadspas.steps[0].id = 'aanvraag';
    contentStadspas.steps[0].status = 'Aanvraag';

    contentStadspas.steps[1].id = 'inBehandeling';
    contentStadspas.steps[1].status = 'In behandeling';

    contentStadspas.steps[2].id = 'besluit';
    contentStadspas.steps[2].status = 'Besluit';

    nock(`http://localhost:${BFF_PORT}`)
      .get('/test-api/wpi/uitkering-en-stadspas/aanvragen')
      .reply(200, {
        content: [contentBijstandsuitkering, contentStadspas],
      });

    nock(`http://localhost:${BFF_PORT}`)
      .get('/test-api/wpi/stadspas')
      .reply(200, {
        content: {
          adminNumber: '123123123',
          ownerType: 'hoofdpashouder',
          stadspassen: [],
        },
      });

    const response = await fetchStadspas(sessionID, requestHeaders);

    expect(response.status).toBe('OK');
    expect(response.content?.aanvragen?.length).toBe(1);
  });

  test('fetchStadspas-with-error', async () => {
    nock(`http://localhost:${BFF_PORT}`)
      .get('/test-api/wpi/uitkering-en-stadspas/aanvragen')
      .reply(404, {
        content: null,
      });

    const response = await fetchStadspas(sessionID, requestHeaders);

    expect(response.status).toBe('OK');
    expect(response.content?.aanvragen?.length).toBe(0);
    expect(response.failedDependencies).toBeDefined();
    expect('aanvragen' in (response.failedDependencies || {})).toBe(true);
    expect(response.failedDependencies?.aanvragen.message).toBe(
      'Error: Request failed with status code 404'
    );
  });

  xtest('fetchWpiNotifications', () => {
    const result = fetchWpiNotifications(sessionID, requestHeaders);
  });
});
