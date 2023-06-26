import nock from 'nock';
import { ApiErrorResponse, jsonCopy } from '../../../universal/helpers';
import { BFF_PORT } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  fetchBijstandsuitkering,
  FetchConfig,
  fetchRequestProcess,
  fetchSpecificaties,
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
  let requestID = '';
  let authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private' },
    token: 'xxxxx',
  };

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
      statusId: 'finish',
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

  let _Date = Date;
  const constantDate = new Date('2017-06-13T04:41:20');

  /*eslint no-global-assign:off*/
  //@ts-expect-error
  global.Date = class extends Date {
    //@ts-expect-error
    constructor() {
      return constantDate;
    }
  };

  afterAll(() => {
    nock.enableNetConnect();
    nock.restore();
    global.Date = _Date;
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test('fetchRequestProcess', async () => {
    nock(`http://localhost:${BFF_PORT}`)
      .get('/wpi/uitkering-en-stadspas/aanvragen')
      .reply(200, { status: 'OK', content });

    const fetchConfig: FetchConfig = {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse: jest.fn((response) => response.content),
      requestCacheKey: 'test-fetch-request-process',
    };

    const getLabelsMock = jest.fn(
      (requestProcess: WpiRequestProcess) => FakeRequestProcessLabels
    );

    const response = await fetchRequestProcess(
      requestID,
      authProfileAndToken,
      getLabelsMock,
      fetchConfig
    );

    expect(response.status).toBe('OK');
    expect(response.content?.length).toBe(1);

    const [statusLine] = response.content || [];
    expect(statusLine.statusId).toBe('finish');

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
      .get('/wpi/uitkering-en-stadspas/aanvragen')
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
      requestID,
      authProfileAndToken,
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
    contentBijstandsuitkering.statusId = 'herstelTermijn';
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
      .get('/wpi/uitkering-en-stadspas/aanvragen')
      .reply(200, {
        status: 'OK',
        content: [contentBijstandsuitkering, { about: 'Stadspas' }, null],
      });

    const response = await fetchBijstandsuitkering(requestID, {
      profile: { authMethod: 'digid', profileType: 'private' },
      token: 'xxxxx',
    });

    expect(response.status).toBe('OK');
    expect(response.content?.length).toBe(1);

    const [statusLine] = response.content || [];
    expect(statusLine.statusId).toBe('herstelTermijn');
    expect(statusLine.link).toMatchInlineSnapshot(`
      Object {
        "title": "Bekijk uw aanvraag",
        "to": "/inkomen/bijstandsuitkering/xxxxxxxfxaxkxex1xx",
      }
    `);

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
    contentStadspas.statusId = 'besluit';

    contentStadspas.steps[0].id = 'aanvraag';
    contentStadspas.steps[0].status = 'Aanvraag';

    contentStadspas.steps[1].id = 'inBehandeling';
    contentStadspas.steps[1].status = 'In behandeling';

    contentStadspas.steps[2].id = 'besluit';
    contentStadspas.steps[2].status = 'Besluit';

    nock(`http://localhost:${BFF_PORT}`)
      .get('/wpi/uitkering-en-stadspas/aanvragen')
      .reply(200, {
        status: 'OK',
        content: [contentBijstandsuitkering, contentStadspas],
      });

    nock(`http://localhost:${BFF_PORT}`)
      .get('/wpi/stadspas')
      .reply(200, {
        status: 'OK',
        content: {
          adminNumber: '123123123',
          stadspassen: [],
        },
      });

    const response = await fetchStadspas(requestID, {
      profile: { authMethod: 'digid', profileType: 'private' },
      token: 'xxxxx',
    });

    expect(response.status).toBe('OK');
    expect(response.content?.aanvragen?.length).toBe(1);

    expect(response.content?.aanvragen?.[0].link).toMatchInlineSnapshot(`
      Object {
        "title": "Bekijk uw aanvraag",
        "to": "/stadspas/aanvraag/xxxxxxxfxaxkxex1xx",
      }
    `);
  });

  test('fetchStadspas-with-error', async () => {
    nock(`http://localhost:${BFF_PORT}`)
      .get('/wpi/uitkering-en-stadspas/aanvragen')
      .reply(404, {
        content: null,
      });

    const response = await fetchStadspas(requestID, {
      profile: { authMethod: 'digid', profileType: 'private' },
      token: 'xxxxx',
    });

    expect(response.status).toBe('OK');
    expect(response.content?.aanvragen?.length).toBe(0);
    expect(response.failedDependencies).toBeDefined();
    expect('aanvragen' in (response.failedDependencies || {})).toBe(true);
    expect(response.failedDependencies?.aanvragen.message).toBe(
      'Error: Request failed with status code 404'
    );
  });

  test('fetchWpiNotifications', async () => {
    nock(`http://localhost:${BFF_PORT}`)
      .get('/wpi/uitkering-en-stadspas/aanvragen')
      .reply(200, {
        status: 'OK',
        content: [
          {
            id: '51918e8b948742c8b25e97889b2f07b1',
            title: 'Stadspas',
            about: 'Stadspas',
            statusId: 'besluit',
            decision: 'afwijzing',
            datePublished: '2022-04-28T00:00:00+02:00',
            dateStart: '2022-04-08T15:05:52+02:00',
            dateEnd: '2022-04-28T00:00:00+02:00',
            steps: [
              {
                id: 'aanvraag',
                status: 'Aanvraag',
                documents: [],
                datePublished: '2022-04-08T15:05:52+02:00',
              },
              {
                id: 'inBehandeling',
                status: 'In behandeling',
                documents: [],
                datePublished: '2022-04-10T15:05:52+02:00',
                dateDecisionExpected: '2022-06-03T15:05:52+02:00',
              },
              {
                id: 'besluit',
                status: 'Besluit',
                documents: [],
                datePublished: '2022-04-28T00:00:00+02:00',
                decision: 'afwijzing',
              },
            ],
          },
          {
            id: '966d872b686bbf363f5ac78f8bad9fc6',
            title: 'Bijstandsuitkering',
            about: 'Bijstandsuitkering',
            statusId: 'besluit',
            decision: 'afwijzing',
            datePublished: '2017-08-21T15:05:52+02:00',
            dateStart: '2017-08-17T15:05:52+02:00',
            dateEnd: '2017-08-21T15:05:52+02:00',
            steps: [
              {
                id: 'aanvraag',
                status: 'Aanvraag',
                documents: [],
                datePublished: '2017-08-17T15:05:52+02:00',
              },
              {
                id: 'inBehandeling',
                status: 'In behandeling',
                documents: [],
                datePublished: '2017-08-17T15:05:52+02:00',
                dateDecisionExpected: '2017-10-05T15:05:52+02:00',
              },
              {
                id: 'herstelTermijn',
                status: 'Meer informatie',
                documents: [],
                datePublished: '2017-08-18T15:05:52+02:00',
                dateDecisionExpected: '2017-10-15T15:05:52+02:00',
                dateUserFeedbackExpected: '2017-08-27T15:05:52+02:00',
              },
              {
                id: 'besluit',
                status: 'Besluit',
                documents: [],
                datePublished: '2017-08-21T15:05:52+02:00',
                decision: 'afwijzing',
              },
            ],
          },
        ],
      })
      .get('/wpi/stadspas')
      .reply(200, {
        status: 'OK',
        content: {
          adminNumber: '123123123',
          stadspassen: [
            {
              id: 200771,
              passNumber: '6064366011012605999',
              owner: 'A Kumari',
              passType: 'kind',
              dateEnd: '2022-07-31T23:59:59.000Z',
              budgets: [
                {
                  description: 'eenmalig extra kindtegoed',
                  code: 'AMS_test_extra0/3_21/22',
                  budgetAssigned: 25,
                  budgetBalance: 25,
                  urlTransactions:
                    '/wpi/stadspas/transacties/xxxxxxxxxxxxxxxxx1234',
                  dateEnd: '2022-07-31T21:59:59.000Z',
                },
              ],
            },
          ],
        },
      })
      .get('/wpi/uitkering/specificaties-en-jaaropgaven')
      .reply(200, {
        status: 'OK',
        content: {
          jaaropgaven: [
            {
              datePublished: '2022-01-05T00:00:00+01:00',
              id: '660000000010024',
              title: 'Jaaropgave 2022',
              variant: null,
              url: '/wpi/document?id=660000000010024&isBulk=False&isDms=False',
            },
          ],
          uitkeringsspecificaties: [
            {
              datePublished: '2022-08-01T00:00:00+02:00',
              id: '660000000010112',
              title: 'Uitkeringsspecificatie Augustus-2022',
              variant: null,
              url: '/wpi/document?id=660000000010112&isBulk=False&isDms=False',
            },
          ],
        },
      })
      .get('/wpi/e-aanvragen')
      .reply(200, {
        status: 'OK',
        content: [
          {
            id: '7827bafbbd75d88a90376ea6e0f618df',
            title: 'Tozo 1 (aangevraagd voor 1 juni 2020)',
            about: 'Tozo 1',
            dateStart: '2022-02-23T16:26:14.174591',
            datePublished: '2022-02-23T16:26:14.175972',
            dateEnd: '2022-02-23T16:26:14.175972',
            decision: 'afwijzing',
            statusId: 'besluit',
            steps: [
              {
                id: 'aanvraag',
                status: 'Aanvraag',
                datePublished: '2022-02-23T16:26:14.174591',
                documents: [],
              },
              {
                id: 'voorschot',
                status: 'Voorschot',
                datePublished: '2022-02-23T16:26:14.175881',
                documents: [],
              },

              {
                id: 'besluit',
                status: 'Besluit',
                datePublished: '2022-02-23T16:26:14.175898',
                documents: [
                  {
                    id: '1645629974.175899',
                    dcteId: '175303',
                    title: 'Besluit toekenning uitkering',
                    url: '/wpi/document?id=1645629974.175899&isBulk=False&isDms=False',
                    datePublished: '2022-02-23T16:26:14.175898',
                  },
                ],
                decision: 'toekenning',
                productSpecific: 'uitkering',
              },
            ],
          },
        ],
      });

    const response = await fetchWpiNotifications(requestID, {
      profile: { authMethod: 'digid', profileType: 'private' },
      token: 'xxxxx',
    });

    expect(response.content).toMatchInlineSnapshot(`
      Object {
        "notifications": Array [
          Object {
            "chapter": "STADSPAS",
            "datePublished": "2022-04-08T15:05:52+02:00",
            "description": "Wij hebben uw aanvraag voor een Stadspas ontvangen op 08 april 2022.",
            "id": "51918e8b948742c8b25e97889b2f07b1-notification",
            "link": Object {
              "title": "Bekijk hoe het met uw aanvraag staat",
              "to": "/stadspas/aanvraag/51918e8b948742c8b25e97889b2f07b1",
            },
            "title": "Stadspas: Wij hebben uw aanvraag ontvangen",
          },
          Object {
            "chapter": "STADSPAS",
            "datePublished": "2022-04-10T15:05:52+02:00",
            "description": "Wij hebben uw aanvraag voor een Stadspas in behandeling genomen op 10 april 2022.",
            "id": "51918e8b948742c8b25e97889b2f07b1-notification",
            "link": Object {
              "title": "Bekijk hoe het met uw aanvraag staat",
              "to": "/stadspas/aanvraag/51918e8b948742c8b25e97889b2f07b1",
            },
            "title": "Stadspas: Wij behandelen uw aanvraag",
          },
          Object {
            "chapter": "STADSPAS",
            "datePublished": "2022-04-28T00:00:00+02:00",
            "description": "U hebt geen recht op een Stadspas (besluit 28 april 2022).",
            "id": "51918e8b948742c8b25e97889b2f07b1-notification",
            "link": Object {
              "title": "Bekijk hoe het met uw aanvraag staat",
              "to": "/stadspas/aanvraag/51918e8b948742c8b25e97889b2f07b1",
            },
            "title": "Stadspas: Uw aanvraag is afgewezen",
          },
          Object {
            "chapter": "STADSPAS",
            "datePublished": "2022-04-28",
            "description": "
        Je hebt nog een saldo van €10 of meer voor het kindtegoed.
        Het saldo vervalt op 31 juli 2023.
        ",
            "id": "stadspas-budget-notification",
            "link": Object {
              "title": "Check het saldo",
              "to": "/stadspas/saldo/200771",
            },
            "title": "Stadspas kindtegoed: Maak je tegoed op voor 30 juli 2023!",
          },
          Object {
            "chapter": "INKOMEN",
            "datePublished": "2022-02-23T16:26:14.174591",
            "description": "Wij hebben uw aanvraag Tozo 1 (aangevraagd voor 1 juni 2020) ontvangen op 23 februari om 21.41 uur",
            "id": "7827bafbbd75d88a90376ea6e0f618df-notification",
            "link": Object {
              "title": "Bekijk hoe het met uw aanvraag staat",
              "to": "/inkomen/tozo/1/7827bafbbd75d88a90376ea6e0f618df",
            },
            "title": "Wij hebben uw aanvraag Tozo 1 ontvangen",
          },
          Object {
            "chapter": "INKOMEN",
            "datePublished": "2022-02-23T16:26:14.175881",
            "description": "Wij hebben een voorschot naar uw rekening overgemaakt.",
            "id": "7827bafbbd75d88a90376ea6e0f618df-notification",
            "link": Object {
              "title": "Bekijk hoe het met uw aanvraag staat",
              "to": "/inkomen/tozo/1/7827bafbbd75d88a90376ea6e0f618df",
            },
            "title": "Tozo 1: Wij hebben een voorschot betaald",
          },
          Object {
            "chapter": "INKOMEN",
            "datePublished": "2022-02-23T16:26:14.175898",
            "description": "U hebt recht op de Tozo 1 uitkering (besluit: 23 februari 2022).",
            "id": "7827bafbbd75d88a90376ea6e0f618df-notification",
            "link": Object {
              "title": "Bekijk hoe het met uw aanvraag staat",
              "to": "/inkomen/tozo/1/7827bafbbd75d88a90376ea6e0f618df",
            },
            "title": "Tozo 1: Uw aanvraag is toegekend",
          },
          Object {
            "chapter": "INKOMEN",
            "datePublished": "2022-01-05T00:00:00+01:00",
            "description": "Uw Jaaropgave 2022 staat voor u klaar.",
            "id": "nieuwe-jaaropgave",
            "link": Object {
              "download": "2022-08-01-Jaaropgave 2022",
              "title": "Bekijk jaaropgave",
              "to": "http://localhost/bff/api/v1/relay/wpi/document?id=660000000010024&isBulk=False&isDms=False",
            },
            "title": "Nieuwe jaaropgave",
          },
          Object {
            "chapter": "INKOMEN",
            "datePublished": "2022-08-01T00:00:00+02:00",
            "description": "Uw uitkeringsspecificatie van augustus 2022 staat voor u klaar.",
            "id": "nieuwe-uitkeringsspecificatie",
            "link": Object {
              "download": "2022-08-01-Uitkeringsspecificatie Augustus-2022",
              "title": "Bekijk uitkeringsspecificatie",
              "to": "http://localhost/bff/api/v1/relay/wpi/document?id=660000000010112&isBulk=False&isDms=False",
            },
            "title": "Nieuwe uitkeringsspecificatie",
          },
        ],
      }
    `);
  });

  test('Service error', async () => {
    nock(`http://localhost:${BFF_PORT}`)
      .get('/wpi/uitkering/specificaties-en-jaaropgaven')
      .reply(401, {
        status: 'ERROR',
        content: null,
      })
      .get('/wpi/e-aanvragen')
      .reply(401, {
        status: 'ERROR',
        content: null,
      });

    const specs = await fetchSpecificaties(requestID, {
      profile: { authMethod: 'digid', profileType: 'private' },
      token: 'xxxxx',
    });

    expect(specs).toMatchInlineSnapshot(`
      Object {
        "content": null,
        "message": "Error: Request failed with status code 401",
        "status": "ERROR",
      }
    `);
  });
});
