import { describe, expect, it, vi } from 'vitest';
import { remoteApi } from '../../../test-utils';
import { jsonCopy } from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import vergunningenData from '../../../../mocks/fixtures/vergunningen.json';
import {
  createToeristischeVerhuurNotification,
  fetchToeristischeVerhuur,
} from './toeristische-verhuur';
import { VakantieverhuurVergunning } from './vakantieverhuur-vergunning';
import { BBVergunning } from './bb-vergunning';

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

  const DUMMY_TOKEN = 'xxxxx';

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
        resultaat: 'Verleend met overgangsrecht',
        initator: 'Weerd',
        adres: 'SchniffSchnaff 4C 1234AB Amsterdam',
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
      expect(typeof registratie.street).toBe('string');
      expect(typeof registratie.houseNumber).toBe('string');
      expect(typeof registratie.postalCode).toBe('string');
    }

    expect(
      response.content.vakantieverhuurVergunningen.every(
        (vergunning) => vergunning.titel === 'Vergunning vakantieverhuur'
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
    remoteApi.get('/decosjoin/getvergunningen').replyWithError('No can do!');
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
      authProfileAndToken,
      'commercial'
    );

    expect(response.content.lvvRegistraties.length).toBe(0);
  });

  it('Should create notifcations from vergunningen', async () => {
    const vakantieverhuurVergunning: VakantieverhuurVergunning = {
      id: 'Z-000-000040',
      titel: 'Vergunning vakantieverhuur',
      datumAfhandeling: null,
      datumAanvraag: '10 mei 2021',
      datumVan: '01 juni 2019',
      datumTot: '31 mei 2020',
      adres: 'Amstel 1 1017AB Amsterdam',
      resultaat: 'Verleend',
      zaaknummer: 'Z/000/000040',
      statussen: [
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
      documentenUrl:
        '/decosjoin/listdocuments/gAAAAABfOl8BFgweMqwmY9tcEAPAxQWJ9SBWhDTQ7AJiil0gZugQ37PC4I3f2fLEwmClmh59sYy3i4olBXM2uMWNzxrigD01Xuf7vL3DFuVp4c8SK_tj6nLLrf4QyGq1SqNESYjPTW_n',
      link: {
        to: '/toeristische-verhuur/vergunning/vakantieverhuur/Z-000-000040',
        title: 'Bekijk hoe het met uw aanvraag staat',
      },
      isActief: false,
      status: 'Afgehandeld',
    };

    const bbVergunnig: BBVergunning = {
      datumAfhandeling: '22 maart 2023',
      datumAanvraag: '13 februari 2023',
      datumVan: '22 maart 2023',
      datumTot: '01 juli 2028',
      resultaat: 'Verleend',
      heeftOvergangsRecht: true,
      id: 'Z-23-2130506',
      zaakId: '-999741',
      zaaknummer: 'Z/23/2130506',
      link: {
        to: '/toeristische-verhuur/vergunning/bed-and-breakfast/Z-23-2130506',
        title: 'Vergunning bed & breakfast',
      },
      adres: 'SchniffSchnaff 4C 1234AB Amsterdam',
      eigenaar: '',
      aanvrager: '',
      titel: 'Vergunning bed & breakfast',
      statussen: [
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
      status: 'Afgehandeld',
      isActief: true,
      documents: [],
    };

    const notification3 = createToeristischeVerhuurNotification(
      vakantieverhuurVergunning,
      []
    );

    expect(notification3.title).toBe(
      `Aanvraag ${vakantieverhuurVergunning.titel.toLowerCase()} verleend`
    );
    expect(notification3.description).toBe(
      `Wij hebben uw aanvraag voor een ${vakantieverhuurVergunning.titel.toLowerCase()} met gemeentelijk zaaknummer ${
        vakantieverhuurVergunning.zaaknummer
      } verleend.`
    );
    expect(notification3.link?.title).toBe('Bekijk uw aanvraag');

    const notification4 = createToeristischeVerhuurNotification(
      { ...vakantieverhuurVergunning, datumTot: '2021-05-30' },
      []
    );

    expect(notification4.title).toBe(
      'Uw vergunning vakantieverhuur is verlopen'
    );

    const notification5 = createToeristischeVerhuurNotification(
      { ...vakantieverhuurVergunning, datumTot: '2021-08-30' },
      []
    );

    expect(notification5.title).toBe('Uw vergunning vakantieverhuur loopt af');

    const notification6 = createToeristischeVerhuurNotification(
      bbVergunnig,
      []
    );

    expect(notification6.title).toBe(
      `Aanvraag vergunning bed & breakfast verleend`
    );
    expect(notification6.description).toBe(
      `Wij hebben uw aanvraag voor een vergunning bed & breakfast met gemeentelijk zaaknummer ${bbVergunnig.zaaknummer} verleend.`
    );
    expect(notification6.link?.title).toBe('Bekijk uw aanvraag');

    const notification7 = createToeristischeVerhuurNotification(
      { ...bbVergunnig, datumTot: '2021-05-30' },
      []
    );

    expect(notification7.title).toBe(
      'Uw vergunning bed & breakfast is verlopen'
    );

    const notification8 = createToeristischeVerhuurNotification(
      { ...bbVergunnig, datumTot: '2021-08-30' },
      []
    );

    expect(notification8.title).toBe('Uw vergunning bed & breakfast loopt af');
  });
});
