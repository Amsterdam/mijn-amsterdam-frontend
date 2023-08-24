import MockAdapter from 'axios-mock-adapter';
import { jsonCopy } from '../../universal/helpers';
import { ApiConfig } from '../config';
import { axiosRequest } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';
import vergunningenData from '../mock-data/json/vergunningen.json';
import {
  createToeristischeVerhuurNotification,
  fetchToeristischeVerhuur,
} from './toeristische-verhuur';
import { toeristischeVerhuurVergunningTypes } from './vergunningen/vergunningen';

describe('Toeristische verhuur service', () => {
  const axMock = new MockAdapter(axiosRequest);
  const VERGUNNINGEN_DUMMY_RESPONSE = jsonCopy(vergunningenData);
  const REGISTRATIES_DUMMY_RESPONSE_NUMBERS = [
    {
      registrationNumber: 'AAAAAAAAAAAAAAAAAAAA',
    },
    {
      registrationNumber: 'BBBBBBBBBBBBBBBBBBBB',
    },
  ];
  const REGISTRATIES_DUMMY_RESPONSE = {
    registrationNumber: 'AAAA AAAA AAAA AAAA AAAA',
    rentalHouse: {
      street: 'Amstel',
      houseNumber: '1',
      houseLetter: null,
      houseNumberExtension: null,
      postalCode: '1012PN',
      city: 'Amsterdam',
      shortName: 'Amstel',
      owner: null,
    },
    agreementDate: '2021-01-01T10:47:44.6107122',
  };

  const TOERISTISCHE_VERHUUR_VERGUNNINGEN_URL = ApiConfig.VERGUNNINGEN.url;

  const DUMMY_URL_VERGUNNINGEN = '/vergunningen';
  const DUMMY_URL_NULL_CONTENT = '/null-content';
  const DUMMY_URL_ERROR = '/error-response/';
  const DUMMY_URL_ERROR_2 = '/another-error/';

  const authProfileAndToken: AuthProfileAndToken = {
    profile: { authMethod: 'digid', profileType: 'private', id: 'DIGID-BSN' },
    token: 'xxxxxx',
  };

  vi.useFakeTimers().setSystemTime(new Date('2021-07-07').getTime());

  const BFF_LVV_API_URL = process.env.BFF_LVV_API_URL;

  afterAll(() => {
    axMock.restore();
    ApiConfig.VERGUNNINGEN.url = TOERISTISCHE_VERHUUR_VERGUNNINGEN_URL;
    process.env.BFF_LVV_API_URL = BFF_LVV_API_URL;
  });

  axMock
    .onPost(BFF_LVV_API_URL + '/bsn')
    .reply(200, REGISTRATIES_DUMMY_RESPONSE_NUMBERS);

  axMock
    .onGet(new RegExp(`${BFF_LVV_API_URL}*`))
    .reply(200, REGISTRATIES_DUMMY_RESPONSE);

  axMock.onGet(DUMMY_URL_VERGUNNINGEN).reply(200, VERGUNNINGEN_DUMMY_RESPONSE);
  axMock.onGet(DUMMY_URL_NULL_CONTENT).reply(200, null);

  axMock
    .onGet(DUMMY_URL_ERROR)
    .reply(500, { status: 'ERROR', message: 'fat chance!', content: null });

  axMock
    .onAny(new RegExp(`${DUMMY_URL_ERROR}*`))
    .reply(500, { message: 'fat chance!', content: null });

  axMock
    .onPost(new RegExp(`${DUMMY_URL_ERROR_2}*`))
    .reply(200, REGISTRATIES_DUMMY_RESPONSE_NUMBERS);

  axMock.onGet(new RegExp(`${DUMMY_URL_ERROR_2}*`)).reply(500, null);

  it('Should respond with both vergunningen and registraties', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_VERGUNNINGEN;

    const response = await fetchToeristischeVerhuur('x1', authProfileAndToken);

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
    const response = await fetchToeristischeVerhuur('x1', authProfileAndToken);

    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_ERROR;

    const response2 = await fetchToeristischeVerhuur('x1', authProfileAndToken);

    expect(response === response2).toBe(true);
  });

  it('Should respond with 1 failed dependency: vergunningen failed', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_ERROR;

    const response = await fetchToeristischeVerhuur('x2', authProfileAndToken);

    expect(response.content.registraties.length).toBeGreaterThan(0);
    expect(response.content.vergunningen.length).toBe(0);
    expect(response.failedDependencies?.vergunningen).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: Request failed with status code 500',
    });
  });

  it('Should respond with 1 failed dependency: registrationNumbers failed', async () => {
    process.env.BFF_LVV_API_URL = DUMMY_URL_ERROR;

    const response = await fetchToeristischeVerhuur('x3', authProfileAndToken);

    expect(response.failedDependencies?.registraties).toStrictEqual({
      status: 'DEPENDENCY_ERROR',
      content: null,
      message: `[registrationNumbers] Error: Request failed with status code 500  `,
    });
  });

  it('Should respond with 2 failed dependencies', async () => {
    ApiConfig.VERGUNNINGEN.url = DUMMY_URL_ERROR;
    process.env.BFF_LVV_API_URL = DUMMY_URL_ERROR_2;

    const response = await fetchToeristischeVerhuur('x4', authProfileAndToken);

    expect(response.failedDependencies?.registraties).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Could not retrieve all registration details',
    });

    expect(response.failedDependencies?.vergunningen).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: Request failed with status code 500',
    });
  });

  it('Should return only vergunningen if commercial profiletype', async () => {
    const response = await fetchToeristischeVerhuur(
      'x4.b',
      authProfileAndToken,
      'commercial'
    );

    expect(response.content.registraties.length).toBe(0);
  });

  it('Should create notifcations from vergunningen', async () => {
    const dummyData: any = [
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

    const notification3 = createToeristischeVerhuurNotification(
      dummyData[0],
      dummyData
    );

    expect(notification3.title).toBe(
      `Aanvraag ${dummyData[0].title.toLowerCase()} verleend`
    );
    expect(notification3.description).toBe(
      `Wij hebben uw aanvraag voor een ${dummyData[0].title.toLowerCase()} met gemeentelijk zaaknummer ${
        dummyData[0].identifier
      } verleend.`
    );
    expect(notification3.link?.title).toBe('Bekijk uw aanvraag');

    const notification4 = createToeristischeVerhuurNotification(
      { ...dummyData[0], dateEnd: '2021-05-30' },
      dummyData
    );

    expect(notification4.title).toBe(
      'Uw vergunning vakantieverhuur is verlopen'
    );

    const notification5 = createToeristischeVerhuurNotification(
      { ...dummyData[0], dateEnd: '2021-08-30' },
      dummyData
    );

    expect(notification5.title).toBe('Uw vergunning vakantieverhuur loopt af');

    const notification6 = createToeristischeVerhuurNotification(
      dummyData[1],
      dummyData
    );

    expect(notification6.title).toBe(
      `Aanvraag vergunning bed & breakfast verleend`
    );
    expect(notification6.description).toBe(
      `Wij hebben uw aanvraag voor een vergunning bed & breakfast met gemeentelijk zaaknummer ${dummyData[1].identifier} verleend.`
    );
    expect(notification6.link?.title).toBe('Bekijk uw aanvraag');

    const notification7 = createToeristischeVerhuurNotification(
      { ...dummyData[1], dateEnd: '2021-05-30' },
      dummyData
    );

    expect(notification7.title).toBe(
      'Uw vergunning bed & breakfast is verlopen'
    );

    const notification8 = createToeristischeVerhuurNotification(
      { ...dummyData[1], dateEnd: '2021-08-30' },
      dummyData
    );

    expect(notification8.title).toBe('Uw vergunning bed & breakfast loopt af');
  });
});
