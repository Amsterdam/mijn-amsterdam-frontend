import Mockdate from 'mockdate';
import { describe, expect, it } from 'vitest';

import { fetchToeristischeVerhuur } from './toeristische-verhuur';
import { VakantieverhuurVergunningFrontend } from './toeristische-verhuur-config-and-types';
import { createToeristischeVerhuurNotification } from './toeristische-verhuur-notifications';
import { BBVergunningFrontend } from './toeristische-verhuur-powerbrowser-bb-vergunning-types';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';

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

const DUMMY_TOKEN = 'xxxxx';

const authProfileAndToken = getAuthProfileAndToken();

describe('Toeristische verhuur service', () => {
  beforeAll(() => {
    Mockdate.set('2021-07-07');
  });
  afterAll(() => {
    Mockdate.reset();
  });

  it('Should respond with both vergunningen and registraties', async () => {
    remoteApi.post('/lvv/bsn').reply(200, REGISTRATIES_DUMMY_RESPONSE_NUMBERS);
    remoteApi
      .get('/lvv/BBBBBBBBBBBBBBBBBBBB')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE)
      .get('/lvv/AAAAAAAAAAAAAAAAAAAA')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE);

    remoteApi.post('/powerbrowser/Token').reply(200, DUMMY_TOKEN);
    remoteApi.post('/powerbrowser/Report/RunSavedReport').reply(200, [
      {
        id: '-999741',
        zaaktype: 'Vergunningaanvraag behandelen',
        product: 'Bed & Breakfast',
        zaaK_IDENTIFICATIE: 'Z/12/3456789',
        startdatum: '2023-02-12T23:00:00.0000000Z',
        einddatum: '2023-03-21T23:00:00.0000000Z',
        datumingang: '2023-03-21T23:00:00.0000000Z',
        besluitdatumvervallen: '2028-06-30T22:00:00.0000000Z',
        status: 'Gereed',
        decision: 'Verleend met overgangsrecht',
        initator: 'Weerd',
        location: 'SchniffSchnaff 4C 1234AB Amsterdam',
      },
    ]);
    remoteApi.post('/powerbrowser/Report/RunSavedReport').reply(200, [
      {
        omschrijving: 'Intake',
        datum: '2019-07-29T07:46:26.0000000Z',
      },
      {
        omschrijving: 'Gereed',
        datum: '2019-07-28T22:00:00.0000000Z',
      },
    ]);

    const response = await fetchToeristischeVerhuur('x1', authProfileAndToken);

    expect(response.content.lvvRegistraties.length).toBeGreaterThan(0);

    for (const registratie of response.content.lvvRegistraties!) {
      expect(typeof registratie.registrationNumber).toBe('string');
      expect(typeof registratie.address).toBe('string');
    }

    expect(
      response.content.vakantieverhuurVergunningen.every((vergunning) =>
        vergunning.title.endsWith('vakantieverhuur')
      )
    ).toBe(true);
  });

  it('Should respond with 1 failed dependency: vergunningen failed', async () => {
    remoteApi.post('/lvv/bsn').reply(200, REGISTRATIES_DUMMY_RESPONSE_NUMBERS);
    remoteApi
      .get('/lvv/BBBBBBBBBBBBBBBBBBBB')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE)
      .get('/lvv/AAAAAAAAAAAAAAAAAAAA')
      .reply(200, REGISTRATIES_DUMMY_RESPONSE);

    remoteApi
      .post((url) => url.includes('/search/books?properties=false&select=key'))
      .replyWithError('No can do!');

    const response = await fetchToeristischeVerhuur('x3', authProfileAndToken);

    expect(response.content.lvvRegistraties.length).toBeGreaterThan(0);
    expect(response.content.vakantieverhuurVergunningen.length).toBe(0);
    expect(
      response.failedDependencies?.vakantieverhuurVergunningen
    ).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'No can do!',
    });
  });

  it('Should respond with 1 failed dependency: registrationNumbers failed', async () => {
    remoteApi.post('/lvv/bsn').replyWithError('Not Available');
    const response = await fetchToeristischeVerhuur('x4', authProfileAndToken);

    expect(response.failedDependencies?.lvvRegistraties).toStrictEqual({
      status: 'DEPENDENCY_ERROR',
      content: null,
      message: `[registrationNumbers] Not Available`,
    });
  });

  it('Should respond with 2 failed dependencies', async () => {
    remoteApi.post('/lvv/bsn').reply(200, REGISTRATIES_DUMMY_RESPONSE_NUMBERS);
    remoteApi
      .post((url) => url.includes('/search/books?properties=false&select=key'))
      .replyWithError('No can do!');
    remoteApi.get(/lvv/).times(2).replyWithError('blap!');

    const response = await fetchToeristischeVerhuur('x5', authProfileAndToken);

    expect(response.failedDependencies?.lvvRegistraties).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'Could not retrieve all registration details',
    });

    expect(
      response.failedDependencies?.vakantieverhuurVergunningen
    ).toStrictEqual({
      status: 'ERROR',
      content: null,
      message: 'No can do!',
    });
  });

  it('Should return only vergunningen if commercial profiletype', async () => {
    const response = await fetchToeristischeVerhuur(
      'x4.b',
      authProfileAndToken
    );

    expect(response.content.lvvRegistraties.length).toBe(0);
  });

  it('Should create notifcations from vergunningen', async () => {
    const vakantieverhuurVergunning: VakantieverhuurVergunningFrontend = {
      id: 'Z-000-000040',
      processed: true,
      key: 'xx123',
      title: 'Vergunning vakantieverhuur',
      caseType: 'Vakantieverhuur vergunningsaanvraag',
      dateDecision: null,
      dateDecisionFormatted: null,
      dateRequest: '10 mei 2021',
      dateRequestFormatted: '10 mei 2021',
      dateStart: '01 juni 2019',
      dateStartFormatted: '01 juni 2019',
      dateEnd: '31 mei 2020',
      dateEndFormatted: '31 mei 2020',
      location: 'Amstel 1 1017AB Amsterdam',
      decision: 'Verleend',
      isVerleend: true,
      identifier: 'Z/000/000040',
      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'In behandeling',
          datePublished: '2021-05-10',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-3',
          status: 'Afgehandeld',
          datePublished: '2021-05-10',
          description: '',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-4',
          status: 'Gewijzigd',
          datePublished: '2020-05-31',
          description: 'Uw Vergunning vakantieverhuur is verlopen.',
          isActive: true,
          isChecked: true,
        },
      ],

      fetchDocumentsUrl:
        '/api/v1/services/toeristische-verhuur/vakantieverhuur-vergunning/documents/list?id=xxxxx',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-000-000040',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      displayStatus: 'Afgehandeld',
    };

    const bbVergunnig: BBVergunningFrontend = {
      dateDecision: '22 maart 2023',
      dateDecisionFormatted: '22 maart 2023',
      dateRequest: '13 februari 2023',
      dateRequestFormatted: '13 februari 2023',
      dateStart: '22 maart 2023',
      dateStartFormatted: '22 maart 2023',
      dateEnd: '01 juli 2028',
      dateEndFormatted: '01 juli 2028',
      decision: 'Verleend',
      isVerleend: true,
      id: 'Z-23-2130506',
      identifier: 'Z/23/2130506',
      heeftOvergangsRecht: false,
      link: {
        to: '/toeristische-verhuur/vergunning/bed-and-breakfast/Z-23-2130506',
        title: 'vergunning bed & breakfast',
      },
      location: 'SchniffSchnaff 4C 1234AB Amsterdam',
      title: 'Vergunning bed & breakfast',

      steps: [
        {
          id: 'step-1',
          status: 'Ontvangen',
          datePublished: '13 februari 2023',
          isActive: false,
          isChecked: true,
        },
        {
          id: 'step-2',
          status: 'Afgehandeld',
          datePublished: '22 maart 2023',
          description: '',
          isActive: true,
          isChecked: true,
        },
      ],
      displayStatus: 'Afgehandeld',
      processed: true,
      documents: [],
    };

    const notification3 = createToeristischeVerhuurNotification(
      vakantieverhuurVergunning,
      new Date()
    );

    expect(notification3.title).toBe(
      `Aanvraag ${vakantieverhuurVergunning.title.toLowerCase()} verleend`
    );
    expect(notification3.description).toBe(
      `Wij hebben uw aanvraag voor een ${vakantieverhuurVergunning.title.toLowerCase()} met gemeentelijk zaaknummer ${
        vakantieverhuurVergunning.identifier
      } verleend.`
    );
    expect(notification3.link?.title).toBe('Bekijk uw aanvraag');

    const notification4 = createToeristischeVerhuurNotification(
      { ...vakantieverhuurVergunning, dateEnd: '2021-05-30' },
      new Date()
    );

    expect(notification4.title).toBe(
      'Uw vergunning vakantieverhuur is verlopen'
    );

    const notification5 = createToeristischeVerhuurNotification(
      { ...vakantieverhuurVergunning, dateEnd: '2021-08-30' },
      new Date()
    );

    expect(notification5.title).toBe('Uw vergunning vakantieverhuur loopt af');

    const notification6 = createToeristischeVerhuurNotification(
      bbVergunnig,
      new Date()
    );

    expect(notification6.title).toBe(
      `Aanvraag vergunning bed & breakfast verleend`
    );
    expect(notification6.description).toBe(
      `Wij hebben uw aanvraag voor een vergunning bed & breakfast met gemeentelijk zaaknummer ${bbVergunnig.identifier} verleend.`
    );
    expect(notification6.link?.title).toBe('Bekijk uw aanvraag');

    const notification7 = createToeristischeVerhuurNotification(
      { ...bbVergunnig, dateEnd: '2021-05-30' },
      new Date()
    );

    expect(notification7.title).toBe(
      'Uw vergunning bed & breakfast is verlopen'
    );

    const notification8 = createToeristischeVerhuurNotification(
      { ...bbVergunnig, dateEnd: '2021-08-30' },
      new Date()
    );

    expect(notification8.title).toBe('Uw vergunning bed & breakfast loopt af');
  });
});
