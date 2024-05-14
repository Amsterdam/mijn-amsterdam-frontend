import { describe, expect, it, vi } from 'vitest';
import { remoteApi } from '../../test-utils';
import { jsonCopy } from '../../universal/helpers';
import { AuthProfileAndToken } from '../helpers/app';
import vergunningenData from '../mock-data/json/vergunningen.json';
import {
  createToeristischeVerhuurNotification,
  fetchToeristischeVerhuur,
} from './toeristische-verhuur/toeristische-verhuur';
import { toeristischeVerhuurVergunningTypes } from './vergunningen/vergunningen';

describe('Toeristische verhuur service', () => {
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

  const authProfileAndToken: AuthProfileAndToken = {
    profile: {
      authMethod: 'digid',
      profileType: 'private',
      id: 'DIGID-BSN',
      sid: '',
    },
    token: 'xxxxxx',
  };

  vi.useFakeTimers().setSystemTime(new Date('2021-07-07').getTime());

  it('Should respond with both vergunningen and registraties', async () => {
    remoteApi.post('/lvv/bsn').reply(200, REGISTRATIES_DUMMY_RESPONSE_NUMBERS);
    remoteApi
      .get('/lvv/BBBBBBBBBBBBBBBBBBBB')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE)
      .get('/lvv/AAAAAAAAAAAAAAAAAAAA')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE);
    remoteApi
      .get('/decosjoin/getvergunningen')
      .reply(200, VERGUNNINGEN_DUMMY_RESPONSE);

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
    remoteApi.post('/lvv/bsn').reply(200, REGISTRATIES_DUMMY_RESPONSE_NUMBERS);
    remoteApi
      .get('/lvv/BBBBBBBBBBBBBBBBBBBB')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE)
      .get('/lvv/AAAAAAAAAAAAAAAAAAAA')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE);
    remoteApi
      .get('/decosjoin/getvergunningen')
      .reply(200, VERGUNNINGEN_DUMMY_RESPONSE);

    const response = await fetchToeristischeVerhuur('x2', authProfileAndToken);
    const response2 = await fetchToeristischeVerhuur('x2', authProfileAndToken);

    expect(response === response2).toBe(true);
  });

  it('Should respond with 1 failed dependency: vergunningen failed', async () => {
    remoteApi.post('/lvv/bsn').reply(200, REGISTRATIES_DUMMY_RESPONSE_NUMBERS);
    remoteApi
      .get('/lvv/BBBBBBBBBBBBBBBBBBBB')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE)
      .get('/lvv/AAAAAAAAAAAAAAAAAAAA')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE);

    remoteApi.get('/decosjoin/getvergunningen').replyWithError('No can do!');

    const response = await fetchToeristischeVerhuur('x3', authProfileAndToken);

    expect(response.content.registraties.length).toBeGreaterThan(0);
    expect(response.content.vergunningen.length).toBe(0);
    expect(response.failedDependencies?.vergunningen).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: No can do!',
    });
  });

  it('Should respond with 1 failed dependency: registrationNumbers failed', async () => {
    remoteApi.post('/lvv/bsn').replyWithError('Not Available');
    const response = await fetchToeristischeVerhuur('x4', authProfileAndToken);

    expect(response.failedDependencies?.registraties).toStrictEqual({
      status: 'DEPENDENCY_ERROR',
      content: null,
      message: `[registrationNumbers] Error: Not Available`,
    });
  });

  it('Should respond with 2 failed dependencies', async () => {
    remoteApi.post('/lvv/bsn').reply(200, REGISTRATIES_DUMMY_RESPONSE_NUMBERS);
    remoteApi.get('/decosjoin/getvergunningen').replyWithError('No can do!');
    remoteApi.get(/lvv/).times(2).replyWithError('blap!');

    const response = await fetchToeristischeVerhuur('x5', authProfileAndToken);

    expect(response.failedDependencies?.registraties).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Could not retrieve all registration details',
    });

    expect(response.failedDependencies?.vergunningen).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Error: No can do!',
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
