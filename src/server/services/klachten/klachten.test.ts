import { AuthProfileAndToken } from './../../helpers/app';
import nock from 'nock';
import {
  fetchAllKlachten,
  fetchKlachtenGenerated,
  transformKlachtenResponse,
} from './klachten';
import apiResponse from '../../mock-data/json/klachten.json';
import { ApiConfig } from '../../config';

describe('Klachten', () => {
  const penv = process.env;

  const requestId = '456';

  const profileAndToken: AuthProfileAndToken = {
    profile: {
      id: '123',
      authMethod: 'digid',
      profileType: 'private',
    },
    token: 'abc123',
  };

  ApiConfig.KLACHTEN.postponeFetch = false;

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

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  describe('fetchAllKlachten', () => {
    describe('less than 20 complaints', () => {
      let scope: nock.Scope | undefined = undefined;

      beforeEach(() => {
        scope = nock('http://localhost')
          .post('/smile')
          .reply(200, {
            rowcount: 5,
            List: apiResponse.List.slice(0, 5),
          });
      });

      it('should perform the expected number of API requests', async () => {
        const res = await fetchAllKlachten(requestId, profileAndToken);

        expect(scope!.isDone()).toBeTruthy();
        expect(res.status).toBe('OK');
        expect(res.content?.aantal).toBe(5);
        expect(res.content?.klachten.length).toBe(5);
      });
    });

    describe('more than 20 complaints', () => {
      let scope: nock.Scope | undefined = undefined;

      beforeEach(() => {
        scope = nock('http://localhost')
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
      });

      it('should perform the expected number of API requests', async () => {
        const res = await fetchAllKlachten(requestId, profileAndToken);

        expect(scope!.isDone()).toBeTruthy();
        expect(res.status).toBe('OK');
        expect(res.content?.aantal).toBe(10);
        expect(res.content?.klachten.length).toBe(10);
      });

      describe('klachtenGenerated', () => {
        it('should generate the expected response', async () => {
          const res = await fetchKlachtenGenerated(requestId, profileAndToken);

          expect(res).toMatchInlineSnapshot(`
            Object {
              "content": Object {
                "notifications": Array [
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-04-05T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-23054-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/23054",
                    },
                    "title": "Klacht ontvangen",
                  },
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-05-05T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-250566-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/250566",
                    },
                    "title": "Klacht ontvangen",
                  },
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-06-13T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-28032-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/28032",
                    },
                    "title": "Klacht ontvangen",
                  },
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-02-13T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-23782-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/23782",
                    },
                    "title": "Klacht ontvangen",
                  },
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-01-12T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-43800-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/43800",
                    },
                    "title": "Klacht ontvangen",
                  },
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-04-05T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-230541-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/230541",
                    },
                    "title": "Klacht ontvangen",
                  },
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-05-05T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-2505661-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/2505661",
                    },
                    "title": "Klacht ontvangen",
                  },
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-06-13T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-280321-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/280321",
                    },
                    "title": "Klacht ontvangen",
                  },
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-02-13T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-237821-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/237821",
                    },
                    "title": "Klacht ontvangen",
                  },
                  Object {
                    "chapter": "KLACHTEN",
                    "datePublished": "2022-01-12T00:00:00.000Z",
                    "description": "Uw klacht is ontvangen.",
                    "id": "klacht-438001-notification",
                    "link": Object {
                      "title": "Bekijk details",
                      "to": "/klachten/klacht/438001",
                    },
                    "title": "Klacht ontvangen",
                  },
                ],
              },
              "status": "OK",
            }
          `);
        });
      });
    });
  });

  describe('transformKlachtenResponse', () => {
    beforeEach(() => {
      nock('http://localhost').post('/smile').reply(200, apiResponse);
    });

    it('should transform the data correctly', () => {
      const res = transformKlachtenResponse(apiResponse);

      expect(res.klachten.length).toEqual(apiResponse.List.length);

      expect(res.klachten[2]).toEqual({
        inbehandelingSinds: '2022-06-14T00:00:00.000Z',
        ontvangstDatum: '2022-06-13T00:00:00.000Z',
        omschrijving: 'Geachte mevrouw, meneer,\r\nEen klacht.',
        gewensteOplossing: '',
        onderwerp: 'Belastingen en heffingen',
        id: '28032',
        locatie: '',
        link: {
          title: 'Klacht 28032',
          to: '/klachten/klacht/28032',
        },
      });
    });

    it('should return data in expected format', async () => {
      const res = await fetchAllKlachten(requestId, profileAndToken);

      expect(res).toMatchInlineSnapshot(`
        Object {
          "content": Object {
            "aantal": 30,
            "klachten": Array [
              Object {
                "gewensteOplossing": "",
                "id": "23054",
                "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 23054",
                  "to": "/klachten/klacht/23054",
                },
                "locatie": "",
                "omschrijving": "Dit is de omschrijving van de klacht",
                "onderwerp": "Overlast, onderhoud en afval",
                "ontvangstDatum": "2022-04-05T00:00:00.000Z",
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
                "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 28032",
                  "to": "/klachten/klacht/28032",
                },
                "locatie": "",
                "omschrijving": "Geachte mevrouw, meneer,
        Een klacht.",
                "onderwerp": "Belastingen en heffingen",
                "ontvangstDatum": "2022-06-13T00:00:00.000Z",
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
                "ontvangstDatum": "2022-02-13T00:00:00.000Z",
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
                "onderwerp": "Contact met een medewerker",
                "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "230541",
                "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 230541",
                  "to": "/klachten/klacht/230541",
                },
                "locatie": "",
                "omschrijving": "Dit is de omschrijving van de klacht",
                "onderwerp": "Overlast, onderhoud en afval",
                "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "2505661",
                "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 2505661",
                  "to": "/klachten/klacht/2505661",
                },
                "locatie": "",
                "omschrijving": "Dear Amsterdam Municipality,
        Thank you and kind regards, Sven Carlin",
                "onderwerp": "GGD en Veiligthuis",
                "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "280321",
                "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 280321",
                  "to": "/klachten/klacht/280321",
                },
                "locatie": "",
                "omschrijving": "Geachte mevrouw, meneer,
        Een klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "Boosterprik",
                "id": "237821",
                "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 237821",
                  "to": "/klachten/klacht/237821",
                },
                "locatie": "RAI",
                "omschrijving": "Nog een klacht.",
                "onderwerp": "Boosterprik",
                "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "438001",
                "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 438001",
                  "to": "/klachten/klacht/438001",
                },
                "locatie": "Weesperplein",
                "omschrijving": "Nog een andere klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "2305412",
                "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 2305412",
                  "to": "/klachten/klacht/2305412",
                },
                "locatie": "",
                "omschrijving": "Dit is de omschrijving van de klacht",
                "onderwerp": "Overlast, onderhoud en afval",
                "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "2505662",
                "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 2505662",
                  "to": "/klachten/klacht/2505662",
                },
                "locatie": "",
                "omschrijving": "Dear Amsterdam Municipality,
        Thank you and kind regards, Sven Carlin",
                "onderwerp": "",
                "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "280322",
                "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 280322",
                  "to": "/klachten/klacht/280322",
                },
                "locatie": "",
                "omschrijving": "Geachte mevrouw, meneer,
        Een klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "Boosterprik",
                "id": "2378222",
                "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 2378222",
                  "to": "/klachten/klacht/2378222",
                },
                "locatie": "RAI",
                "omschrijving": "Nog een klacht.",
                "onderwerp": "Boosterprik",
                "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "438002",
                "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 438002",
                  "to": "/klachten/klacht/438002",
                },
                "locatie": "Weesperplein",
                "omschrijving": "Nog een andere klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "2305422",
                "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 2305422",
                  "to": "/klachten/klacht/2305422",
                },
                "locatie": "",
                "omschrijving": "Dit is de omschrijving van de klacht",
                "onderwerp": "Overlast, onderhoud en afval",
                "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "25056622",
                "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 25056622",
                  "to": "/klachten/klacht/25056622",
                },
                "locatie": "",
                "omschrijving": "Dear Amsterdam Municipality,
        Thank you and kind regards, Sven Carlin",
                "onderwerp": "",
                "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "2803222",
                "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 2803222",
                  "to": "/klachten/klacht/2803222",
                },
                "locatie": "",
                "omschrijving": "Geachte mevrouw, meneer,
        Een klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "Boosterprik",
                "id": "23782223",
                "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 23782223",
                  "to": "/klachten/klacht/23782223",
                },
                "locatie": "RAI",
                "omschrijving": "Nog een klacht.",
                "onderwerp": "Boosterprik",
                "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "43800222",
                "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 43800222",
                  "to": "/klachten/klacht/43800222",
                },
                "locatie": "Weesperplein",
                "omschrijving": "Nog een andere klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "2305432",
                "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 2305432",
                  "to": "/klachten/klacht/2305432",
                },
                "locatie": "",
                "omschrijving": "Dit is de omschrijving van de klacht",
                "onderwerp": "Overlast, onderhoud en afval",
                "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "2505663",
                "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 2505663",
                  "to": "/klachten/klacht/2505663",
                },
                "locatie": "",
                "omschrijving": "Dear Amsterdam Municipality,
        Thank you and kind regards, Sven Carlin",
                "onderwerp": "",
                "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "280323",
                "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 280323",
                  "to": "/klachten/klacht/280323",
                },
                "locatie": "",
                "omschrijving": "Geachte mevrouw, meneer,
        Een klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "Boosterprik",
                "id": "237823",
                "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 237823",
                  "to": "/klachten/klacht/237823",
                },
                "locatie": "RAI",
                "omschrijving": "Nog een klacht.",
                "onderwerp": "Boosterprik",
                "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "438003",
                "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 438003",
                  "to": "/klachten/klacht/438003",
                },
                "locatie": "Weesperplein",
                "omschrijving": "Nog een andere klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "2305443",
                "inbehandelingSinds": "2022-05-06T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 2305443",
                  "to": "/klachten/klacht/2305443",
                },
                "locatie": "",
                "omschrijving": "Dit is de omschrijving van de klacht",
                "onderwerp": "Overlast, onderhoud en afval",
                "ontvangstDatum": "2022-04-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "25056643",
                "inbehandelingSinds": "2022-05-18T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 25056643",
                  "to": "/klachten/klacht/25056643",
                },
                "locatie": "",
                "omschrijving": "Dear Amsterdam Municipality,
        Thank you and kind regards, Sven Carlin",
                "onderwerp": "",
                "ontvangstDatum": "2022-05-05T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "280324",
                "inbehandelingSinds": "2022-06-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 280324",
                  "to": "/klachten/klacht/280324",
                },
                "locatie": "",
                "omschrijving": "Geachte mevrouw, meneer,
        Een klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-06-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "Boosterprik",
                "id": "237824",
                "inbehandelingSinds": "2022-04-14T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 237824",
                  "to": "/klachten/klacht/237824",
                },
                "locatie": "RAI",
                "omschrijving": "Nog een klacht.",
                "onderwerp": "Boosterprik",
                "ontvangstDatum": "2022-02-13T00:00:00.000Z",
              },
              Object {
                "gewensteOplossing": "",
                "id": "438004",
                "inbehandelingSinds": "2022-04-12T00:00:00.000Z",
                "link": Object {
                  "title": "Klacht 438004",
                  "to": "/klachten/klacht/438004",
                },
                "locatie": "Weesperplein",
                "omschrijving": "Nog een andere klacht.",
                "onderwerp": "",
                "ontvangstDatum": "2022-01-12T00:00:00.000Z",
              },
            ],
          },
          "status": "OK",
        }
      `);
    });
  });
});
