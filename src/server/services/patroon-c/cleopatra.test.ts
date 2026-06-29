import { describe, expect, test } from 'vitest';

import {
  fetchMilieuzone,
  fetchMilieuzoneNotifications,
  fetchOvertredingen,
  fetchOvertredingenNotifications,
  getJSONRequestPayload,
} from './cleopatra.ts';
import { getAuthProfileAndToken, remoteApi } from '../../../testing/utils.ts';

const mocks = vi.hoisted(() => {
  return {
    IS_DEVELOPMENT: false,
    getCert: vi.fn(),
  };
});

vi.mock('../../../universal/config/env', async (importOriginal) => {
  const mod: object = await importOriginal();
  return {
    ...mod,
    get IS_DEVELOPMENT() {
      return mocks.IS_DEVELOPMENT;
    },
  };
});

vi.mock('../../helpers/cert.ts', async (importOriginal) => {
  const mod: object = await importOriginal();
  return {
    ...mod,
    getCert: mocks.getCert,
  };
});

const authProfileAndToken = getAuthProfileAndToken();

describe('simple-connect/cleopatra', () => {
  beforeEach(() => {
    mocks.IS_DEVELOPMENT = true;
    process.env.BFF_CLEOPATRA_PUBLIC_KEY_CERT = '';
  });

  test('missing certificate', async () => {
    mocks.IS_DEVELOPMENT = false;

    const responseContent = await fetchMilieuzone(authProfileAndToken);

    expect(responseContent).toMatchInlineSnapshot(`
      {
        "content": null,
        "message": "Postdata could not be encrypted",
        "status": "ERROR",
      }
    `);
  });

  test('mock certificate', async () => {
    remoteApi.post('/cleopatra').reply(200);
    mocks.getCert.mockImplementationOnce(
      () =>
        `-----BEGIN CERTIFICATE-----
MIIDKTCCAhGgAwIBAgIUH3T+M+qH2we45D1tDf2o0DAiS88wDQYJKoZIhvcNAQEL
BQAwJDEiMCAGA1UEAwwZVGVzdCBDbGVvcGF0cmEgUHVibGljIEtleTAeFw0yNjA2
MjYwODUxMTFaFw0yNzA2MjYwODUxMTFaMCQxIjAgBgNVBAMMGVRlc3QgQ2xlb3Bh
dHJhIFB1YmxpYyBLZXkwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCf
NhV8ri+RdqxrihX1Xl1eK8Ube4IeWZUSDKJSBefiTIrDjj1vqnQjZAhighQt3nLj
u3Gd6xi6URK+NSTkfDImftmpayKi+Z+Q8vrur98weSVjLr8Ym+xd0IAU359GhKgW
vKly8RuyGUEq7xjrrUM61aTo8jZgK0JUDhgLuqCm8byylm/uO712+h3b9qVgFwjB
2PscdnPgvMyu+e0hcBDDzxI8jFXAZxD0cjlW9rdWRVvGNj6C5w+bc+N2B0iupiv+
GOauU74+gBSL7dO1rbrPhBp9Hj9GKUCUt3igZ5ZeMOczUHKNgzd1wQ8xETJbDMbu
z+8H+fOdtUY76NbcTK/fAgMBAAGjUzBRMB0GA1UdDgQWBBQKaimNXHQdgAa1Yi1P
Tt9jpDKJOjAfBgNVHSMEGDAWgBQKaimNXHQdgAa1Yi1PTt9jpDKJOjAPBgNVHRMB
Af8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQAfPr/7KgybxsdO1iZ6Y+a/9ifM
7YOH7Keh2Kk2+Z2NVKGTkVt7prnqSIQyZIVvF1hzXdQfd7Qi7lQMDCHU2g8rCEXB
nn3nJ3bo6aH6PtrvRhAg5Gt4SDBxkt2Pqn/FV1PVqjr65ANfDWe5sjGeYtpbwMKl
lc5I/L4gatti01Wqm47VCYwn64zzpAIMUBXcfzmp4Zz+d2g85AEO6GZ4DQeTyBJQ
N/LGpYv3Lx6B91U2osmuHpNUfZ392tSp4FJItJz8X2X0pLI+GPIwlQDpZG/IEQ9d
5mIjHI8tk0u6JOGCf2TdyFWSOUA2e1WzTAJ9cNmnKpM/6Q+vvo1SB4Ll8vZg
-----END CERTIFICATE-----
`
    );
    mocks.IS_DEVELOPMENT = false;

    const responseContent = await fetchMilieuzone(authProfileAndToken);

    expect(responseContent.status).toBe('OK');
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
