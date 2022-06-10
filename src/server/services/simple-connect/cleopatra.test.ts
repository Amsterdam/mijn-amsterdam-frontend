import nock from 'nock';
import { ApiConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  fetchMilieuzone,
  fetchMilieuzoneGenerated,
  getJSONRequestPayload,
} from './cleopatra';

const REQUEST_ID = 'test-x-123';
const authProfileAndToken: AuthProfileAndToken = {
  profile: { authMethod: 'digid', profileType: 'private' },
  token: 'xxxxxx',
};

describe('simple-connect/cleopatra', () => {
  const url = ApiConfig.CLEOPATRA.url;

  ApiConfig.CLEOPATRA.url = 'http://localhost/cleopatra/remote/api';

  afterAll(() => {
    // Enable http requests.
    nock.enableNetConnect();
    nock.restore();

    ApiConfig.CLEOPATRA.url = url;
  });

  beforeAll(() => {
    nock.disableNetConnect();
  });

  test('getJSONRequestPayload', () => {
    expect(
      getJSONRequestPayload({
        id: 'test-digid',
        profileType: 'private',
        authMethod: 'digid',
      })
    ).toMatchInlineSnapshot(`"{\\"bsn\\":\\"test-digid\\"}"`);

    expect(
      getJSONRequestPayload({
        id: 'test-eherk',
        profileType: 'commercial',
        authMethod: 'eherkenning',
      })
    ).toMatchInlineSnapshot(`"{\\"kvk\\":\\"test-eherk\\"}"`);
  });

  test('fetchMilieuzone null content', async () => {
    nock('http://localhost').post('/cleopatra/remote/api').reply(200);

    const responseContent = await fetchMilieuzone(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "isKnown": false,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchMilieuzone content', async () => {
    nock('http://localhost')
      .post('/cleopatra/remote/api')
      .times(2)
      .reply(200, {
        content: [
          {
            categorie: 'M1',
            datum: '2019-03-13',
            titel: 'Uw aanvraag ontheffing milieuzone Brom- en snorfietsen',
            omschrijving:
              'Uw moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen',
            url: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/1',
            urlNaam: 'Betaal direct',
          },
          {
            categorie: 'M1',
            datum: '2019-03-13',
            titel: 'Uw aanvraag ontheffing milieuzone Brom- en snorfietsen',
            omschrijving:
              'Uw moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen',
            url: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/2',
            urlNaam: 'Betaal direct',
          },
          {
            categorie: 'F2',
          },
        ],
        status: 'OK',
      });

    const responseContent = await fetchMilieuzone(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "isKnown": true,
        },
        "status": "OK",
      }
    `);

    const responseContentGenerated = await fetchMilieuzoneGenerated(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContentGenerated).toMatchInlineSnapshot(`
      Object {
        "content": Object {
          "notifications": Array [
            Object {
              "chapter": "MILIEUZONE",
              "datePublished": "2019-03-13",
              "description": "Uw moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen",
              "id": "milieuzone-M1",
              "link": Object {
                "title": "Betaal direct",
                "to": "https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/1",
              },
              "title": "Uw aanvraag ontheffing milieuzone Brom- en snorfietsen",
            },
            Object {
              "chapter": "MILIEUZONE",
              "datePublished": "2019-03-13",
              "description": "Uw moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen",
              "id": "milieuzone-M1",
              "link": Object {
                "title": "Betaal direct",
                "to": "https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/2",
              },
              "title": "Uw aanvraag ontheffing milieuzone Brom- en snorfietsen",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });
});
