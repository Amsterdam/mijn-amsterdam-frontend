import { describe, expect, test } from 'vitest';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  fetchMilieuzone,
  fetchMilieuzoneNotifications,
  fetchOvertredingen,
  fetchOvertredingenNotifications,
  getJSONRequestPayload,
} from './cleopatra';
import { remoteApi } from '../../../test-utils';

const REQUEST_ID = 'test-x-123';
const authProfileAndToken: AuthProfileAndToken = {
  profile: { authMethod: 'digid', profileType: 'private', id: '', sid: '' },
  token: 'xxxxxx',
};

describe('simple-connect/cleopatra', () => {
  test('getJSONRequestPayload', () => {
    expect(
      getJSONRequestPayload({
        id: 'test-digid',
        profileType: 'private',
        authMethod: 'digid',
        sid: '',
      })
    ).toMatchInlineSnapshot(`"{"bsn":"test-digid"}"`);

    expect(
      getJSONRequestPayload({
        id: 'test-eherk',
        profileType: 'commercial',
        authMethod: 'eherkenning',
        sid: '',
      })
    ).toMatchInlineSnapshot(`"{"kvk":"test-eherk"}"`);
  });

  test('fetchMilieuzone null content', async () => {
    remoteApi.post('/cleopatra').reply(200);

    const responseContent = await fetchMilieuzone(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": false,
        },
        "status": "OK",
      }
    `);
  });

  test('fetchMilieuzone content', async () => {
    remoteApi
      .post('/cleopatra')
      .times(2)
      .reply(200, {
        content: [
          {
            categorie: 'M1',
            thema: 'Milieuzone',
            datum: '2019-03-13',
            titel: 'Uw aanvraag ontheffing milieuzone Brom- en snorfietsen',
            omschrijving:
              'U moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen',
            url: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/1',
            urlNaam: 'Betaal direct',
          },
          {
            categorie: 'M1',
            thema: 'Milieuzone',
            datum: '2019-03-13',
            titel: 'Uw aanvraag ontheffing milieuzone Brom- en snorfietsen',
            omschrijving:
              'U moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen',
            url: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/2',
            urlNaam: 'Betaal direct',
          },
          {
            categorie: 'F2',
            thema: 'Milieuzone',
          },
        ],
        status: 'OK',
      });

    const responseContent = await fetchMilieuzone(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": true,
        },
        "status": "OK",
      }
    `);

    const notificationsResponse = await fetchMilieuzoneNotifications(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(notificationsResponse).toMatchInlineSnapshot(`
      {
        "content": {
          "notifications": [
            {
              "datePublished": "2019-03-13",
              "description": "U moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen",
              "id": "MILIEUZONE-M1",
              "link": {
                "title": "Betaal direct",
                "to": "https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/1",
              },
              "thema": "MILIEUZONE",
              "title": "Uw aanvraag ontheffing milieuzone Brom- en snorfietsen",
            },
            {
              "datePublished": "2019-03-13",
              "description": "U moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen",
              "id": "MILIEUZONE-M1",
              "link": {
                "title": "Betaal direct",
                "to": "https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/2",
              },
              "thema": "MILIEUZONE",
              "title": "Uw aanvraag ontheffing milieuzone Brom- en snorfietsen",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });

  test('fetchOvertredingen content', async () => {
    remoteApi
      .post('/cleopatra')
      .times(2)
      .reply(200, {
        content: [
          {
            categorie: 'M1',
            thema: 'Overtredingen',
            datum: '2019-03-13',
            titel: 'Overtreding betalen',
            omschrijving: 'Uw moet uw overtreding nog betalen',
            url: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/1',
            urlNaam: 'Betaal direct',
          },
          {
            categorie: 'F2',
            thema: 'Overtredingen',
          },
        ],
        status: 'OK',
      });

    const responseContent = await fetchOvertredingen(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": true,
        },
        "status": "OK",
      }
    `);

    const notificationsResponse = await fetchOvertredingenNotifications(
      REQUEST_ID,
      authProfileAndToken
    );

    expect(notificationsResponse).toMatchInlineSnapshot(`
      {
        "content": {
          "notifications": [
            {
              "datePublished": "2019-03-13",
              "description": "Uw moet uw overtreding nog betalen",
              "id": "OVERTREDINGEN-M1",
              "link": {
                "title": "Betaal direct",
                "to": "https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/1",
              },
              "thema": "OVERTREDINGEN",
              "title": "Overtreding betalen",
            },
          ],
        },
        "status": "OK",
      }
    `);
  });
});
