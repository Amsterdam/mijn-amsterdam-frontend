import { describe, expect, test } from 'vitest';

import {
  fetchMilieuzone,
  fetchMilieuzoneNotifications,
  fetchOvertredingen,
  fetchOvertredingenNotifications,
  getJSONRequestPayload,
} from './cleopatra';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils';

const mocks = vi.hoisted(() => {
  return {
    IS_TAP: false,
  };
});

vi.mock('../../../universal/config/env', async (importOriginal) => {
  const mod: object = await importOriginal();
  return {
    ...mod,
    get IS_TAP() {
      return mocks.IS_TAP;
    },
  };
});

const authProfileAndToken = getAuthProfileAndToken();

describe('simple-connect/cleopatra', () => {
  beforeEach(() => {
    mocks.IS_TAP = false;
  });

  test('missing certificate', async () => {
    mocks.IS_TAP = true;

    const responseContent = await fetchMilieuzone(authProfileAndToken);

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": null,
        "message": "Postdata could not be encrypted",
        "status": "ERROR",
      }
    `);
  });

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

    const responseContent = await fetchMilieuzone(authProfileAndToken);

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": false,
          "url": "http://localhost:3100/mocks-api/sso/portaal/milieuzone",
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

    const responseContent = await fetchMilieuzone(authProfileAndToken);

    expect(responseContent).toStrictEqual({
      content: {
        isKnown: true,
        url: 'http://localhost:3100/mocks-api/sso/portaal/milieuzone',
      },
      status: 'OK',
    });

    const notificationsResponse =
      await fetchMilieuzoneNotifications(authProfileAndToken);

    expect(notificationsResponse).toStrictEqual({
      content: {
        notifications: [
          {
            datePublished: '2019-03-13',
            description:
              'U moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen',
            id: 'MILIEUZONE-M1',
            link: {
              title: 'Betaal direct',
              to: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/1',
            },
            themaID: 'MILIEUZONE',
            themaTitle: 'Milieuzone',
            title: 'Uw aanvraag ontheffing milieuzone Brom- en snorfietsen',
          },
          {
            datePublished: '2019-03-13',
            description:
              'U moet uw aanvraag voor ontheffing milieuzone Brom- en snorfietsen nog betalen',
            id: 'MILIEUZONE-M1',
            link: {
              title: 'Betaal direct',
              to: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/2',
            },
            themaID: 'MILIEUZONE',
            themaTitle: 'Milieuzone',
            title: 'Uw aanvraag ontheffing milieuzone Brom- en snorfietsen',
          },
        ],
      },
      status: 'OK',
    });
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

    const responseContent = await fetchOvertredingen(authProfileAndToken);

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": {
          "isKnown": true,
          "url": "http://localhost:3100/mocks-api/sso/portaal/overtredingen",
        },
        "status": "OK",
      }
    `);

    const notificationsResponse =
      await fetchOvertredingenNotifications(authProfileAndToken);

    expect(notificationsResponse).toStrictEqual({
      content: {
        notifications: [
          {
            datePublished: '2019-03-13',
            description: 'Uw moet uw overtreding nog betalen',
            id: 'OVERTREDINGEN-M1',
            link: {
              title: 'Betaal direct',
              to: 'https://ontheffingen-acc.amsterdam.nl/publiek/aanvraag/1',
            },
            themaID: 'OVERTREDINGEN',
            themaTitle: 'Overtredingen voertuigen',
            title: 'Overtreding betalen',
          },
        ],
      },
      status: 'OK',
    });
  });
});
