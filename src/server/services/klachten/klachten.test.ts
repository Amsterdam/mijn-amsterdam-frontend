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

    expect(res).toMatchInlineSnapshot(`
      {
        "content": {
          "notifications": [
            {
              "datePublished": "2022-04-05T00:00:00.000Z",
              "description": "Uw klacht is ontvangen.",
              "id": "klacht-230541-notification",
              "link": {
                "title": "Bekijk details",
                "to": "/klachten/klacht/230541",
              },
              "thema": "KLACHTEN",
              "title": "Klacht ontvangen",
            },
            {
              "datePublished": "2022-05-05T00:00:00.000Z",
              "description": "Uw klacht is ontvangen.",
              "id": "klacht-2505661-notification",
              "link": {
                "title": "Bekijk details",
                "to": "/klachten/klacht/2505661",
              },
              "thema": "KLACHTEN",
              "title": "Klacht ontvangen",
            },
            {
              "datePublished": "2022-06-13T00:00:00.000Z",
              "description": "Uw klacht is ontvangen.",
              "id": "klacht-280321-notification",
              "link": {
                "title": "Bekijk details",
                "to": "/klachten/klacht/280321",
              },
              "thema": "KLACHTEN",
              "title": "Klacht ontvangen",
            },
            {
              "datePublished": "2022-02-13T00:00:00.000Z",
              "description": "Uw klacht is ontvangen.",
              "id": "klacht-237821-notification",
              "link": {
                "title": "Bekijk details",
                "to": "/klachten/klacht/237821",
              },
              "thema": "KLACHTEN",
              "title": "Klacht ontvangen",
            },
            {
              "datePublished": "2022-01-12T00:00:00.000Z",
              "description": "Uw klacht is ontvangen.",
              "id": "klacht-438001-notification",
              "link": {
                "title": "Bekijk details",
                "to": "/klachten/klacht/438001",
              },
              "thema": "KLACHTEN",
              "title": "Klacht ontvangen",
            },
          ],
        },
        "status": "OK",
      }
    `);
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
    expect(res).toMatchInlineSnapshot(`
      {
        "content": {
          "aantal": 30,
          "klachten": [
            {
              "gewensteOplossing": "",
              "id": "23054",
              "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
              "link": {
                "title": "Klacht 23054",
                "to": "/klachten/klacht/23054",
              },
              "locatie": "",
              "omschrijving": "Dit is de omschrijving van de klacht",
              "onderwerp": "Overlast, onderhoud en afval",
              "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 april 2022",
              "steps": [],
              "title": "23054",
            },
            {
              "gewensteOplossing": "",
              "id": "250566",
              "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
              "link": {
                "title": "Klacht 250566",
                "to": "/klachten/klacht/250566",
              },
              "locatie": "",
              "omschrijving": "Dear Amsterdam Municipality,
      Thank you and kind regards, Sven Carlin",
              "onderwerp": "",
              "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 mei 2022",
              "steps": [],
              "title": "250566",
            },
            {
              "gewensteOplossing": "",
              "id": "28032",
              "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 28032",
                "to": "/klachten/klacht/28032",
              },
              "locatie": "",
              "omschrijving": "Geachte mevrouw, meneer,
      Een klacht.",
              "onderwerp": "Belastingen en heffingen",
              "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 juni 2022",
              "steps": [],
              "title": "28032",
            },
            {
              "gewensteOplossing": "Boosterprik",
              "id": "23782",
              "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 23782",
                "to": "/klachten/klacht/23782",
              },
              "locatie": "RAI",
              "omschrijving": "Nog een klacht.",
              "onderwerp": "Boosterprik",
              "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 februari 2022",
              "steps": [],
              "title": "23782",
            },
            {
              "gewensteOplossing": "",
              "id": "43800",
              "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
              "link": {
                "title": "Klacht 43800",
                "to": "/klachten/klacht/43800",
              },
              "locatie": "Weesperplein",
              "omschrijving": "Nog een andere klacht.",
              "onderwerp": "Contact met een medewerker",
              "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              "ontvangstDatumFormatted": "12 januari 2022",
              "steps": [],
              "title": "43800",
            },
            {
              "gewensteOplossing": "",
              "id": "230541",
              "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
              "link": {
                "title": "Klacht 230541",
                "to": "/klachten/klacht/230541",
              },
              "locatie": "",
              "omschrijving": "Dit is de omschrijving van de klacht",
              "onderwerp": "Overlast, onderhoud en afval",
              "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 april 2022",
              "steps": [],
              "title": "230541",
            },
            {
              "gewensteOplossing": "",
              "id": "2505661",
              "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
              "link": {
                "title": "Klacht 2505661",
                "to": "/klachten/klacht/2505661",
              },
              "locatie": "",
              "omschrijving": "Dear Amsterdam Municipality,
      Thank you and kind regards, Sven Carlin",
              "onderwerp": "GGD en Veiligthuis",
              "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 mei 2022",
              "steps": [],
              "title": "2505661",
            },
            {
              "gewensteOplossing": "",
              "id": "280321",
              "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 280321",
                "to": "/klachten/klacht/280321",
              },
              "locatie": "",
              "omschrijving": "Geachte mevrouw, meneer,
      Een klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 juni 2022",
              "steps": [],
              "title": "280321",
            },
            {
              "gewensteOplossing": "Boosterprik",
              "id": "237821",
              "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 237821",
                "to": "/klachten/klacht/237821",
              },
              "locatie": "RAI",
              "omschrijving": "Nog een klacht.",
              "onderwerp": "Boosterprik",
              "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 februari 2022",
              "steps": [],
              "title": "237821",
            },
            {
              "gewensteOplossing": "",
              "id": "438001",
              "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
              "link": {
                "title": "Klacht 438001",
                "to": "/klachten/klacht/438001",
              },
              "locatie": "Weesperplein",
              "omschrijving": "Nog een andere klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              "ontvangstDatumFormatted": "12 januari 2022",
              "steps": [],
              "title": "438001",
            },
            {
              "gewensteOplossing": "",
              "id": "2305412",
              "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
              "link": {
                "title": "Klacht 2305412",
                "to": "/klachten/klacht/2305412",
              },
              "locatie": "",
              "omschrijving": "Dit is de omschrijving van de klacht",
              "onderwerp": "Overlast, onderhoud en afval",
              "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 april 2022",
              "steps": [],
              "title": "2305412",
            },
            {
              "gewensteOplossing": "",
              "id": "2505662",
              "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
              "link": {
                "title": "Klacht 2505662",
                "to": "/klachten/klacht/2505662",
              },
              "locatie": "",
              "omschrijving": "Dear Amsterdam Municipality,
      Thank you and kind regards, Sven Carlin",
              "onderwerp": "",
              "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 mei 2022",
              "steps": [],
              "title": "2505662",
            },
            {
              "gewensteOplossing": "",
              "id": "280322",
              "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 280322",
                "to": "/klachten/klacht/280322",
              },
              "locatie": "",
              "omschrijving": "Geachte mevrouw, meneer,
      Een klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 juni 2022",
              "steps": [],
              "title": "280322",
            },
            {
              "gewensteOplossing": "Boosterprik",
              "id": "2378222",
              "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 2378222",
                "to": "/klachten/klacht/2378222",
              },
              "locatie": "RAI",
              "omschrijving": "Nog een klacht.",
              "onderwerp": "Boosterprik",
              "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 februari 2022",
              "steps": [],
              "title": "2378222",
            },
            {
              "gewensteOplossing": "",
              "id": "438002",
              "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
              "link": {
                "title": "Klacht 438002",
                "to": "/klachten/klacht/438002",
              },
              "locatie": "Weesperplein",
              "omschrijving": "Nog een andere klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              "ontvangstDatumFormatted": "12 januari 2022",
              "steps": [],
              "title": "438002",
            },
            {
              "gewensteOplossing": "",
              "id": "2305422",
              "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
              "link": {
                "title": "Klacht 2305422",
                "to": "/klachten/klacht/2305422",
              },
              "locatie": "",
              "omschrijving": "Dit is de omschrijving van de klacht",
              "onderwerp": "Overlast, onderhoud en afval",
              "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 april 2022",
              "steps": [],
              "title": "2305422",
            },
            {
              "gewensteOplossing": "",
              "id": "25056622",
              "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
              "link": {
                "title": "Klacht 25056622",
                "to": "/klachten/klacht/25056622",
              },
              "locatie": "",
              "omschrijving": "Dear Amsterdam Municipality,
      Thank you and kind regards, Sven Carlin",
              "onderwerp": "",
              "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 mei 2022",
              "steps": [],
              "title": "25056622",
            },
            {
              "gewensteOplossing": "",
              "id": "2803222",
              "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 2803222",
                "to": "/klachten/klacht/2803222",
              },
              "locatie": "",
              "omschrijving": "Geachte mevrouw, meneer,
      Een klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 juni 2022",
              "steps": [],
              "title": "2803222",
            },
            {
              "gewensteOplossing": "Boosterprik",
              "id": "23782223",
              "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 23782223",
                "to": "/klachten/klacht/23782223",
              },
              "locatie": "RAI",
              "omschrijving": "Nog een klacht.",
              "onderwerp": "Boosterprik",
              "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 februari 2022",
              "steps": [],
              "title": "23782223",
            },
            {
              "gewensteOplossing": "",
              "id": "43800222",
              "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
              "link": {
                "title": "Klacht 43800222",
                "to": "/klachten/klacht/43800222",
              },
              "locatie": "Weesperplein",
              "omschrijving": "Nog een andere klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              "ontvangstDatumFormatted": "12 januari 2022",
              "steps": [],
              "title": "43800222",
            },
            {
              "gewensteOplossing": "",
              "id": "2305432",
              "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
              "link": {
                "title": "Klacht 2305432",
                "to": "/klachten/klacht/2305432",
              },
              "locatie": "",
              "omschrijving": "Dit is de omschrijving van de klacht",
              "onderwerp": "Overlast, onderhoud en afval",
              "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 april 2022",
              "steps": [],
              "title": "2305432",
            },
            {
              "gewensteOplossing": "",
              "id": "2505663",
              "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
              "link": {
                "title": "Klacht 2505663",
                "to": "/klachten/klacht/2505663",
              },
              "locatie": "",
              "omschrijving": "Dear Amsterdam Municipality,
      Thank you and kind regards, Sven Carlin",
              "onderwerp": "",
              "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 mei 2022",
              "steps": [],
              "title": "2505663",
            },
            {
              "gewensteOplossing": "",
              "id": "280323",
              "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 280323",
                "to": "/klachten/klacht/280323",
              },
              "locatie": "",
              "omschrijving": "Geachte mevrouw, meneer,
      Een klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 juni 2022",
              "steps": [],
              "title": "280323",
            },
            {
              "gewensteOplossing": "Boosterprik",
              "id": "237823",
              "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 237823",
                "to": "/klachten/klacht/237823",
              },
              "locatie": "RAI",
              "omschrijving": "Nog een klacht.",
              "onderwerp": "Boosterprik",
              "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 februari 2022",
              "steps": [],
              "title": "237823",
            },
            {
              "gewensteOplossing": "",
              "id": "438003",
              "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
              "link": {
                "title": "Klacht 438003",
                "to": "/klachten/klacht/438003",
              },
              "locatie": "Weesperplein",
              "omschrijving": "Nog een andere klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              "ontvangstDatumFormatted": "12 januari 2022",
              "steps": [],
              "title": "438003",
            },
            {
              "gewensteOplossing": "",
              "id": "2305443",
              "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
              "link": {
                "title": "Klacht 2305443",
                "to": "/klachten/klacht/2305443",
              },
              "locatie": "",
              "omschrijving": "Dit is de omschrijving van de klacht",
              "onderwerp": "Overlast, onderhoud en afval",
              "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 april 2022",
              "steps": [],
              "title": "2305443",
            },
            {
              "gewensteOplossing": "",
              "id": "25056643",
              "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
              "link": {
                "title": "Klacht 25056643",
                "to": "/klachten/klacht/25056643",
              },
              "locatie": "",
              "omschrijving": "Dear Amsterdam Municipality,
      Thank you and kind regards, Sven Carlin",
              "onderwerp": "",
              "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              "ontvangstDatumFormatted": "05 mei 2022",
              "steps": [],
              "title": "25056643",
            },
            {
              "gewensteOplossing": "",
              "id": "280324",
              "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 280324",
                "to": "/klachten/klacht/280324",
              },
              "locatie": "",
              "omschrijving": "Geachte mevrouw, meneer,
      Een klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 juni 2022",
              "steps": [],
              "title": "280324",
            },
            {
              "gewensteOplossing": "Boosterprik",
              "id": "237824",
              "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
              "link": {
                "title": "Klacht 237824",
                "to": "/klachten/klacht/237824",
              },
              "locatie": "RAI",
              "omschrijving": "Nog een klacht.",
              "onderwerp": "Boosterprik",
              "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              "ontvangstDatumFormatted": "13 februari 2022",
              "steps": [],
              "title": "237824",
            },
            {
              "gewensteOplossing": "",
              "id": "438004",
              "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
              "link": {
                "title": "Klacht 438004",
                "to": "/klachten/klacht/438004",
              },
              "locatie": "Weesperplein",
              "omschrijving": "Nog een andere klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              "ontvangstDatumFormatted": "12 januari 2022",
              "steps": [],
              "title": "438004",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });
});
