import nock from 'nock';
import { fetchKlachten, transformKlachtenResponse } from './klachten';
import apiResponse from '../../mock-data/json/klachten.json';

describe('Klachten', () => {
  const penv = process.env;

  afterAll(() => {
    // Enable http requests.
    nock.enableNetConnect();
    nock.restore();
  });

  beforeAll(() => {
    // Disable real http requests.
    // All requests should be mocked.
    nock.disableNetConnect();

    process.env = {
      ...penv,
      BFF_SMILE_USERNAME: 'test2',
      BFF_SMILE_PASSWORD: 'testpwd2',
    };
  });

  beforeEach(() => {
    nock('http://localhost').post('/smile').reply(200, apiResponse);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('transformKlachtenResponse', () => {
    it('should transform the data correctly', () => {
      const res = transformKlachtenResponse(apiResponse);

      expect(res.length).toEqual(apiResponse.List.length);

      expect(res[2]).toEqual({
        inbehandelingSinds: '2022-05-18T00:00:00.000Z',
        ontvangstDatum: '2022-05-06T00:00:00.000Z',
        omschrijving: 'Geachte mevrouw, meneer,\r\nEen klacht.',
        gewensteOplossing: '',
        onderwerp: '',
        id: '28032',
        locatie: '',
        link: {
          title: 'Klacht 28032',
          to: '/klachten/klacht/28032',
        },
      });
    });

    it('should return data in expected format', async () => {
      const res = await fetchKlachten('456', {
        profile: {
          id: '123',
          authMethod: 'digid',
          profileType: 'private',
        },
        token: 'abc123',
      });

      expect(res).toMatchInlineSnapshot(`
        Object {
          "content": Array [
            Object {
              "gewensteOplossing": "",
              "id": "23054",
              "inbehandelingSinds": "2022-05-30T00:00:00.000Z",
              "link": Object {
                "title": "Klacht 23054",
                "to": "/klachten/klacht/23054",
              },
              "locatie": "",
              "omschrijving": "Dit is de omschrijving van de klacht",
              "onderwerp": "Test voor decentrale toewijzing",
              "ontvangstDatum": "2022-05-29T00:00:00.000Z",
            },
            Object {
              "gewensteOplossing": "",
              "id": "250566",
              "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
              "link": Object {
                "title": "Klacht 250566",
                "to": "/klachten/klacht/250566",
              },
              "locatie": "",
              "omschrijving": "Dear Amsterdam Municipality,
        Thank you and kind regards, Sven Carlin",
              "onderwerp": "",
              "ontvangstDatum": "2022-05-05T00:00:00.000Z",
            },
            Object {
              "gewensteOplossing": "",
              "id": "28032",
              "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
              "link": Object {
                "title": "Klacht 28032",
                "to": "/klachten/klacht/28032",
              },
              "locatie": "",
              "omschrijving": "Geachte mevrouw, meneer,
        Een klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-05-06T00:00:00.000Z",
            },
            Object {
              "gewensteOplossing": "Boosterprik",
              "id": "23782",
              "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
              "link": Object {
                "title": "Klacht 23782",
                "to": "/klachten/klacht/23782",
              },
              "locatie": "RAI",
              "omschrijving": "Nog een klacht.",
              "onderwerp": "Boosterprik",
              "ontvangstDatum": "2022-04-13T00:00:00.000Z",
            },
            Object {
              "gewensteOplossing": "",
              "id": "43800",
              "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
              "link": Object {
                "title": "Klacht 43800",
                "to": "/klachten/klacht/43800",
              },
              "locatie": "Weesperplein",
              "omschrijving": "Nog een andere klacht.",
              "onderwerp": "",
              "ontvangstDatum": "2022-04-12T00:00:00.000Z",
            },
          ],
          "status": "OK",
        }
      `);
    });
  });
});
