import MockDate from 'mockdate';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import {
  FetchConfig,
  fetchBijstandsuitkering,
  fetchRequestProcess,
} from './api-service';
import {
  WpiRequestProcess,
  WpiRequestProcessLabels,
  WpiRequestStatusLabels,
} from './wpi-types';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { ApiErrorResponse } from '../../../universal/helpers/api';
import { jsonCopy } from '../../../universal/helpers/utils';

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
  const authProfileAndToken = getAuthProfileAndToken();

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
          isActive: false,
          isChecked: true,
        },
        {
          id: 'otherStep',
          status: '2e stap in aanvraagproces',
          datePublished: '2022-02-13T06:10',
          documents: [],
          isActive: false,
          isChecked: true,
        },
        {
          id: 'finish',
          status: 'Einde van aanvraagproces',
          datePublished: '2022-03-01T09:49',
          documents: [],
          decision: 'toekenning',
          isActive: true,
          isChecked: true,
        },
      ],
      dateStartFormatted: null,
      dateEndFormatted: null,
      displayStatus: '',
      link: {
        to: '/inkomen/bijstandsuitkering/xxxxxxxfxaxkxex1xx',
        title: 'Bekijk uw aanvraag',
      },
    },
  ];

  beforeAll(() => {
    MockDate.set('2017-06-13T04:41:20');
  });

  afterAll(() => {
    MockDate.reset();
  });

  test('fetchRequestProcess', async () => {
    remoteApi
      .get('/wpi/uitkering/aanvragen')
      .reply(200, { status: 'OK', content });

    const fetchConfig: FetchConfig = {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse: vi.fn((response) => response.content),
      requestCacheKey: 'test-fetch-request-process',
    };

    const getLabelsMock = vi.fn(
      (requestProcess: WpiRequestProcess) => FakeRequestProcessLabels
    );

    const response = await fetchRequestProcess(
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
    remoteApi.get('/wpi/uitkering/aanvragen').reply(500, { content: null });

    const fetchConfig: FetchConfig = {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse: vi.fn((response) => response.content),
      requestCacheKey: 'test-fetch-request-process',
    };

    const getLabelsMock = vi.fn(
      (requestProcess: WpiRequestProcess) => FakeRequestProcessLabels
    );

    const response = await fetchRequestProcess(
      authProfileAndToken,
      getLabelsMock,
      fetchConfig
    );

    expect(response.status).toBe('ERROR');
    expect((response as ApiErrorResponse<any>).message).toBe(
      'Request failed with status code 500'
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

    remoteApi.get('/wpi/uitkering/aanvragen').reply(200, {
      status: 'OK',
      content: [contentBijstandsuitkering, { about: 'FooBar' }, null],
    });

    const response = await fetchBijstandsuitkering(getAuthProfileAndToken());

    expect(response.status).toBe('OK');
    expect(response.content?.length).toBe(1);

    const [statusLine] = response.content || [];
    expect(statusLine.statusId).toBe('herstelTermijn');
    expect(statusLine.link).toMatchInlineSnapshot(`
      {
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
});
