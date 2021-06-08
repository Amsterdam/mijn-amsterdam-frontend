import MockAdapter from 'axios-mock-adapter';
import { jsonCopy } from '../../universal/helpers';
import { ApiConfig } from '../config';
import { axiosRequest } from '../helpers';
import toeristischeVerhuurRegistratiesData from '../mock-data/json/registraties-toeristische-verhuur.json';
import vergunningenData from '../mock-data/json/vergunningen.json';
import {
  createToeristischeVerhuurNotification,
  fetchToeristischeVerhuur,
  transformToeristischeVerhuurVergunningTitle,
} from './toeristische-verhuur';
import { toeristischeVerhuurVergunningTypes } from './vergunningen';

describe('Toeristische verhuur service', () => {
  const axMock = new MockAdapter(axiosRequest);
  const VERGUNNINGEN_DUMMY_RESPONSE = jsonCopy(vergunningenData);
  const REGISTRATIES_DUMMY_RESPONSE = jsonCopy(
    toeristischeVerhuurRegistratiesData
  );

  const TOERISTISCHE_VERHUUR_REGISTRATIES_URL =
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url;
  const TOERISTISCHE_VERHUUR_VERGUNNINGEN_URL = ApiConfig.VERGUNNINGEN.url;

  const DUMMY_URL_REGISTRATIES = '/registraties';
  const DUMMY_URL_VERGUNNINGEN = '/vergunningen';
  const DUMMY_URL_NULL_CONTENT = '/null-content';
  const DUMMY_URL_ERROR = '/error-response';

  jest.useFakeTimers('modern').setSystemTime(new Date('2021-07-07').getTime());

  afterAll(() => {
    axMock.restore();
    ApiConfig.VERGUNNINGEN.url = TOERISTISCHE_VERHUUR_VERGUNNINGEN_URL;
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url = TOERISTISCHE_VERHUUR_REGISTRATIES_URL;
  });

  afterEach(() => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_VERGUNNINGEN;
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url = DUMMY_URL_REGISTRATIES;
  });

  axMock.onGet(DUMMY_URL_REGISTRATIES).reply(200, REGISTRATIES_DUMMY_RESPONSE);
  axMock.onGet(DUMMY_URL_VERGUNNINGEN).reply(200, VERGUNNINGEN_DUMMY_RESPONSE);

  axMock.onGet(DUMMY_URL_NULL_CONTENT).reply(200, null);
  axMock.onGet(DUMMY_URL_ERROR).reply(500, { message: 'fat chance!' });

  it('Should respond with both vergunningen and registraties', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_VERGUNNINGEN;
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url = DUMMY_URL_REGISTRATIES;

    const response = await fetchToeristischeVerhuur('x1', { x: 'saml' });

    expect(response.content.registraties.length).toBeGreaterThan(0);

    for (const registratie of response.content.registraties!) {
      expect(typeof registratie.registrationNumber).toBe('string');
      expect(typeof registratie.street).toBe('string');
      expect(typeof registratie.houseNumber).toBe('string');
      expect(typeof registratie.postalCode).toBe('string');
    }

    expect(
      response.content.vergunningen.every((vergunning) =>
        toeristischeVerhuurVergunningTypes.includes(vergunning.caseType)
      )
    ).toBe(true);
  });

  it('Should reply with memoized response based on function params', async () => {
    const response = await fetchToeristischeVerhuur('x1', { x: 'saml' });

    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_ERROR;

    const response2 = await fetchToeristischeVerhuur('x1', { x: 'saml' });

    expect(response === response2).toBe(true);
  });

  it('Should respond with 1 failed dependency', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_ERROR;
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url = DUMMY_URL_REGISTRATIES;

    const response = await fetchToeristischeVerhuur('x2', { x: 'saml' });

    expect(response.content.registraties.length).toBeGreaterThan(0);
    expect(response.content.vergunningen.length).toBe(0);
    expect(response.failedDependencies?.vergunningen).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: Request failed with status code 500',
    });
  });

  it('Should respond with 2 failed dependencies', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_ERROR;
    ApiConfig.TOERISTISCHE_VERHUUR_REGISTRATIES.url = DUMMY_URL_ERROR;

    const response = await fetchToeristischeVerhuur('x3', { x: 'saml' });

    expect(response.content.registraties.length).toBe(0);
    expect(response.content.vergunningen.length).toBe(0);
    expect(response.failedDependencies?.vergunningen).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: Request failed with status code 500',
    });
    expect(response.failedDependencies?.registraties).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: Request failed with status code 500',
    });
  });

  it('Should have transformed titles of vergunningen', async () => {
    const response = await fetchToeristischeVerhuur('x4', { x: 'saml' });

    for (const vergunning of response.content.vergunningen) {
      expect(
        transformToeristischeVerhuurVergunningTitle(
          vergunning.caseType,
          vergunning.isActual
        ) === vergunning.title
      );
    }
  });

  it('Should create notifcations from vergunningen', async () => {
    const dummyData: any = [
      {
        id: 'i-1',
        caseType: 'Vakantieverhuur',
        dateRequest: '2021-06-01',
        dateStart: '2029-07-10',
        dateEnd: '2029-07-14',
        title: 'Geplande vakantieverhuur',
        status: 'Afgehandeld',
      },
      {
        id: 'i-2',
        caseType: 'Vakantieverhuur afmelding',
        dateRequest: '2021-06-01',
        dateStart: '2021-06-05',
        dateEnd: '2021-06-10',
        title: 'Geannuleerde vakantieverhuur',
        status: 'Ontvangen',
      },
      {
        id: 'i-3',
        identifier: 'Z/1/2/3',
        caseType: 'Vakantieverhuur vergunningsaanvraag',
        dateRequest: '2021-04-01',
        dateStart: '2021-05-01',
        dateEnd: '2022-04-01',
        title: 'Vergunning vakantieverhuur',
        status: 'Afgehandeld',
        decision: 'Verleend',
      },
      {
        id: 'i-4',
        identifier: 'Z/5/6/7',
        caseType: 'B&B - vergunning',
        dateRequest: '2021-04-01',
        dateStart: '2021-05-01',
        dateEnd: '2022-04-01',
        title: 'Vergunning bed & breakfast',
        status: 'Afgehandeld',
        decision: 'Verleend',
      },
    ];

    const notification1 = createToeristischeVerhuurNotification(
      dummyData[0],
      dummyData
    );

    expect(notification1.title).toBe(`Vakantieverhuur gepland`);
    expect(notification1.description).toBe(
      `Wij hebben uw melding voor vakantieverhuur van 10 juli 2029 tot 14 juli 2029 ontvangen.`
    );
    expect(notification1.link?.title).toBe('Bekijk uw geplande verhuur');

    const notification2 = createToeristischeVerhuurNotification(
      dummyData[1],
      dummyData
    );

    expect(notification2.title).toBe(`Vakantieverhuur geannuleerd`);
    expect(notification2.description).toBe(
      `Wij hebben uw annulering voor vakantieverhuur van 05 juni 2021 tot 10 juni 2021 ontvangen.`
    );
    expect(notification2.link?.title).toBe('Bekijk uw geannuleerde verhuur');

    const notification3 = createToeristischeVerhuurNotification(
      dummyData[2],
      dummyData
    );

    expect(notification3.title).toBe(
      `Aanvraag ${dummyData[2].title.toLowerCase()} afgehandeld`
    );
    expect(notification3.description).toBe(
      `Wij hebben uw aanvraag voor een ${dummyData[2].title.toLowerCase()} met gemeentelijk zaaknummer ${
        dummyData[2].identifier
      } afgehandeld.`
    );
    expect(notification3.link?.title).toBe('Bekijk uw aanvraag');

    const notification4 = createToeristischeVerhuurNotification(
      { ...dummyData[2], dateEnd: '2021-05-30' },
      dummyData
    );

    expect(notification4.title).toBe(
      'Uw vergunning vakantieverhuur is verlopen'
    );

    const notification5 = createToeristischeVerhuurNotification(
      { ...dummyData[2], dateEnd: '2021-08-30' },
      dummyData
    );

    expect(notification5.title).toBe('Uw vergunning vakantieverhuur loopt af');

    const notification6 = createToeristischeVerhuurNotification(
      dummyData[3],
      dummyData
    );

    expect(notification6.title).toBe(
      `Aanvraag vergunning bed & breakfast afgehandeld`
    );
    expect(notification6.description).toBe(
      `Wij hebben uw aanvraag voor een vergunning bed & breakfast met gemeentelijk zaaknummer ${dummyData[3].identifier} afgehandeld.`
    );
    expect(notification6.link?.title).toBe('Bekijk uw aanvraag');

    const notification7 = createToeristischeVerhuurNotification(
      { ...dummyData[3], dateEnd: '2021-05-30' },
      dummyData
    );

    expect(notification7.title).toBe(
      'Uw vergunning bed & breakfast is verlopen'
    );

    const notification8 = createToeristischeVerhuurNotification(
      { ...dummyData[3], dateEnd: '2021-08-30' },
      dummyData
    );

    expect(notification8.title).toBe('Uw vergunning bed & breakfast loopt af');
  });
});
