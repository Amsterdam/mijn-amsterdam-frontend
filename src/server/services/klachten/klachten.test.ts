import { afterEach, describe, expect, it, vi } from 'vitest';

import apiResponse from '../../../../mocks/fixtures/klachten.json';
import { remoteApi } from '../../../testing/utils';
import { ApiConfig } from '../../config/source-api';
import { AuthProfileAndToken } from './../../auth/auth-types';
import {
  fetchAllKlachten,
  fetchKlachtenNotifications,
  transformKlachtenResponse,
} from './klachten';

describe('Klachten', () => {
  const requestId = '456';

  const profileAndToken: AuthProfileAndToken = {
    profile: {
      id: '123',
      authMethod: 'digid',
      profileType: 'private',
      sid: '',
    },
    token: 'abc123',
  };

  ApiConfig.ENABLEU_2_SMILE.postponeFetch = false;

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('Fetch all not paginated', async () => {
    const scope = remoteApi.post('/smile').reply(200, {
      rowcount: 5,
      List: apiResponse.List.slice(0, 5),
    });

    const res = await fetchAllKlachten(requestId, profileAndToken);

    expect(scope!.isDone()).toBeTruthy();
    expect(res.status).toBe('OK');
    expect(res.content?.aantal).toBe(5);
    expect(res.content?.klachten.length).toBe(5);
  });

  it('Fetch all paginated', async () => {
    const scope = remoteApi
      .post('/smile')
      .reply(200, {
        rowcount: 10,
        List: apiResponse.List.slice(0, 5),
      })
      .post('/smile')
      .reply(200, {
        rowcount: 10,
        List: apiResponse.List.slice(5, 10),
      });

    const res = await fetchAllKlachten(requestId, profileAndToken);

    expect(scope!.isDone()).toBeTruthy();
    expect(res.status).toBe('OK');
    expect(res.content?.aantal).toBe(10);
    expect(res.content?.klachten.length).toBe(10);
  });

  it('klachtenNotifications: should generate the expected response', async () => {
    const scope = remoteApi.post('/smile').reply(200, {
      rowcount: 5,
      List: apiResponse.List.slice(5, 10),
    });

    const res = await fetchKlachtenNotifications(requestId, profileAndToken);

    expect(res).toStrictEqual({
      content: {
        notifications: [
          {
            datePublished: '2022-04-05T00:00:00.000Z',
            description: 'Uw klacht is ontvangen.',
            id: 'klacht-230541-notification',
            link: {
              title: 'Bekijk details',
              to: '/klachten/klacht/230541',
            },
            themaID: 'KLACHTEN',
            title: 'Klacht ontvangen',
          },
          {
            datePublished: '2022-05-05T00:00:00.000Z',
            description: 'Uw klacht is ontvangen.',
            id: 'klacht-2505661-notification',
            link: {
              title: 'Bekijk details',
              to: '/klachten/klacht/2505661',
            },
            themaID: 'KLACHTEN',
            title: 'Klacht ontvangen',
          },
          {
            datePublished: '2022-06-13T00:00:00.000Z',
            description: 'Uw klacht is ontvangen.',
            id: 'klacht-280321-notification',
            link: {
              title: 'Bekijk details',
              to: '/klachten/klacht/280321',
            },
            themaID: 'KLACHTEN',
            title: 'Klacht ontvangen',
          },
          {
            datePublished: '2022-02-13T00:00:00.000Z',
            description: 'Uw klacht is ontvangen.',
            id: 'klacht-237821-notification',
            link: {
              title: 'Bekijk details',
              to: '/klachten/klacht/237821',
            },
            themaID: 'KLACHTEN',
            title: 'Klacht ontvangen',
          },
          {
            datePublished: '2022-01-12T00:00:00.000Z',
            description: 'Uw klacht is ontvangen.',
            id: 'klacht-438001-notification',
            link: {
              title: 'Bekijk details',
              to: '/klachten/klacht/438001',
            },
            themaID: 'KLACHTEN',
            title: 'Klacht ontvangen',
          },
        ],
      },
      status: 'OK',
    });
  });

  it('should transform the data correctly', () => {
    remoteApi.post('/smile').reply(200, apiResponse);
    const res = transformKlachtenResponse(apiResponse);
    expect(res.klachten.length).toEqual(apiResponse.List.length);
    expect(res.klachten[2]).toEqual({
      inbehandelingSinds: '2022-06-14T00:00:00.000Z',
      ontvangstDatum: '2022-06-13T00:00:00.000Z',
      ontvangstDatumFormatted: '13 juni 2022',
      omschrijving: 'Geachte mevrouw, meneer,\r\nEen klacht.',
      gewensteOplossing: '',
      onderwerp: 'Belastingen en heffingen',
      displayStatus: 'Ontvangen',
      id: '28032',
      title: '28032',
      locatie: '',
      steps: [],
      link: {
        title: 'Klacht 28032',
        to: '/klachten/klacht/28032',
      },
    });
  });

  it('should return data in expected format', async () => {
    remoteApi.post('/smile').reply(200, apiResponse);
    const res = await fetchAllKlachten(requestId, profileAndToken);
    expect(res.content?.klachten.map((klacht) => klacht.id)).toStrictEqual([
      '23054',
      '250566',
      '28032',
      '23782',
      '43800',
      '230541',
      '2505661',
      '280321',
      '237821',
      '438001',
      '2305412',
      '2505662',
      '280322',
      '2378222',
      '438002',
      '2305422',
      '25056622',
      '2803222',
      '23782223',
      '43800222',
      '2305432',
      '2505663',
      '280323',
      '237823',
      '438003',
      '2305443',
      '25056643',
      '280324',
      '237824',
      '438004',
    ]);
  });
});
