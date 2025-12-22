import nock from 'nock';
import { afterEach, describe, expect, vi } from 'vitest';

import { fetchAllKlachten, fetchKlachtenNotifications } from './klachten';
import { SmileKlacht, SmileKlachtenReponse } from './types';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';
import { ApiConfig } from '../../config/source-api';

function createKlacht(props?: Partial<SmileKlacht>): SmileKlacht {
  return {
    klacht_inbehandeling: { value: '20-12-2026 12:00' },
    klacht_datumontvangstklacht: { value: '30-12-2026' },
    klacht_omschrijving: {
      value: 'default description',
    },
    klacht_gewensteoplossing: { value: '' },
    klacht_klachtonderwerp: { value: '' },
    klacht_id: { value: '222222' },
    klacht_locatieadres: { value: '' },
    klacht_status: { value: 'open' },
    klacht_finishedon: { value: '' },
    klacht_klachtopgelost: { value: '' },
    ...props,
  } as unknown as SmileKlacht;
}

function createDupesWithDifferentIDs(amount: number): SmileKlachtenReponse {
  const klachten: SmileKlacht[] = [];
  for (let i = 0; i < amount; i++) {
    const klacht = createKlacht({ klacht_id: { value: i.toString() } });
    klachten.push(klacht);
  }
  return { rowcount: amount, List: klachten };
}

function mockSmileAPI(data: SmileKlachtenReponse): nock.Scope {
  return remoteApi.post('/smile').reply(200, data);
}

const dupeAmount = 5;
const defaultMockResponse = createDupesWithDifferentIDs(dupeAmount);

describe('Klachten', () => {
  const profileAndToken = getAuthProfileAndToken();

  ApiConfig.SMILE.postponeFetch = false;

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Pagination', async () => {
    const amountOfAPICalls = 2;
    const rowcount = defaultMockResponse.rowcount * amountOfAPICalls;
    const scope = mockSmileAPI({
      rowcount,
      List: defaultMockResponse.List,
    })
      .post('/smile')
      .reply(200, { rowcount, List: defaultMockResponse.List });

    const res = await fetchAllKlachten(profileAndToken);
    expect(scope!.isDone()).toBeTruthy();
    expect(res.status).toBe('OK');
    expect(res.content?.length).toBe(10);
  });

  test('Without pagination', async () => {
    const scope = mockSmileAPI(defaultMockResponse);
    const res = await fetchAllKlachten(profileAndToken);

    expect(scope!.isDone()).toBeTruthy();
    expect(res.status).toBe('OK');
    expect(res.content?.length).toBe(5);
  });

  test('All possible notification types', async () => {
    const openKlacht = createKlacht({
      klacht_id: { value: '1' },
      klacht_status: { value: 'Open' },
      klacht_klachtstatus: { value: 'Beoordelen/Accepteren' },
    });
    const closedKlacht = createKlacht({
      klacht_id: { value: '2' },
      klacht_status: { value: 'Gesloten' },
      klacht_klachtstatus: { value: 'Afgesloten' },
      klacht_finishedon: { value: '31-12-2026' },
    });
    mockSmileAPI({
      rowcount: 2,
      List: [openKlacht, closedKlacht],
    });
    const res = await fetchKlachtenNotifications(profileAndToken);
    expect(res).toStrictEqual({
      content: {
        notifications: [
          {
            datePublished: '2026-12-30T00:00:00.000Z',
            description: 'Wij hebben uw klacht met zaaknummer 1 ontvangen.',
            id: 'klacht-1-notification',
            link: {
              title: 'Bekijk details',
              to: '/klachten/klacht/1',
            },
            themaID: 'KLACHTEN',
            themaTitle: 'Klachten',
            title: 'Klacht ontvangen',
          },
          {
            datePublished: '2026-12-31T00:00:00.000Z',
            description:
              'Uw klacht met zaaknummer 2 is afgehandeld. U krijgt een antwoord op uw klacht.',
            id: 'klacht-2-notification',
            link: {
              title: 'Bekijk details',
              to: '/klachten/klacht/2',
            },
            themaID: 'KLACHTEN',
            themaTitle: 'Klachten',
            title: 'Klacht afgehandeld',
          },
        ],
      },
      status: 'OK',
    });
  });

  test('All possible klachten/statustreinen', async () => {
    const openKlacht = createKlacht({
      klacht_id: { value: '1' },
      klacht_status: { value: 'Open' },
      klacht_klachtstatus: { value: 'Beoordelen/Accepteren' },
    });
    const closedKlacht = createKlacht({
      klacht_id: { value: '2' },
      klacht_status: { value: 'Gesloten' },
      klacht_klachtstatus: { value: 'Afgesloten' },
      klacht_finishedon: { value: '31-12-2026' },
    });
    mockSmileAPI({
      rowcount: 2,
      List: [openKlacht, closedKlacht],
    });
    const res = await fetchAllKlachten(profileAndToken);
    expect(res).toStrictEqual({
      content: [
        {
          dateClosed: '',
          dateClosedFormatted: '',
          displayStatus: 'In behandeling',
          gewensteOplossing: '',
          id: '1',
          identifier: '1',
          inbehandelingSinds: '2026-12-20T00:00:00.000Z',
          link: {
            title: 'Klacht 1',
            to: '/klachten/klacht/1',
          },
          locatie: '',
          omschrijving: 'default description',
          onderwerp: '',
          ontvangstDatum: '2026-12-30T00:00:00.000Z',
          ontvangstDatumFormatted: '30 december 2026',
          steps: [
            {
              datePublished: '2026-12-30T00:00:00.000Z',
              id: '1',
              isActive: false,
              isChecked: true,
              status: 'Ontvangen',
            },
            {
              datePublished: '2026-12-30T00:00:00.000Z',
              id: '2',
              isActive: true,
              isChecked: true,
              status: 'In behandeling',
            },
            {
              datePublished: '',
              description: '',
              id: '3',
              isActive: false,
              isChecked: false,
              status: 'Afgehandeld',
            },
          ],
          title: '1',
        },
        {
          dateClosed: '2026-12-31T00:00:00.000Z',
          dateClosedFormatted: '31 december 2026',
          displayStatus: 'Afgehandeld',
          gewensteOplossing: '',
          id: '2',
          identifier: '2',
          inbehandelingSinds: '2026-12-20T00:00:00.000Z',
          link: {
            title: 'Klacht 2',
            to: '/klachten/klacht/2',
          },
          locatie: '',
          omschrijving: 'default description',
          onderwerp: '',
          ontvangstDatum: '2026-12-30T00:00:00.000Z',
          ontvangstDatumFormatted: '30 december 2026',
          steps: [
            {
              datePublished: '2026-12-30T00:00:00.000Z',
              id: '1',
              isActive: false,
              isChecked: true,
              status: 'Ontvangen',
            },
            {
              datePublished: '2026-12-30T00:00:00.000Z',
              id: '2',
              isActive: false,
              isChecked: true,
              status: 'In behandeling',
            },
            {
              datePublished: '2026-12-31T00:00:00.000Z',
              description: `<p>Uw klacht is afgehandeld. U krijgt een antwoord op uw klacht.</p>`,
              id: '3',
              isActive: true,
              isChecked: true,
              status: 'Afgehandeld',
            },
          ],
          title: '2',
        },
      ],
      status: 'OK',
    });
  });
});
