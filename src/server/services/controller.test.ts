import Mockdate from 'mockdate';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import { fetchCMSCONTENT } from './cms/cms-content';
import {
  addServiceResultHandler,
  forTesting,
  servicesTipsByProfileType,
} from './controller';
import {
  getReqMockWithOidc,
  RequestMock,
  ResponseMock,
} from '../../testing/utils';
import { apiSuccessResult } from '../../universal/helpers/api';

const mocks = vi.hoisted(() => {
  return {
    MOCK_SOURCE_TIP: {
      profileTypes: ['private'],
      datePublished: '2022-06-15',
      description: 'Can we fake it today?',
      id: 'mijn-999',
      link: {
        title: 'Kijk op fake.amsterdam',
        to: 'https://fake.amsterdam/',
      },
      reason: ['Omdat dit een fake tip is.'],
      title: 'Voor fake Amsterdammers',
    },
  };
});

vi.mock('./cms/cms-content', () => {
  return {
    fetchCMSCONTENT: vi.fn(),
  };
});

vi.mock('./tips-and-notifications', async () => {
  return {
    getTipsAndNotificationsFromApiResults: vi.fn(),
    sortNotifications: vi.fn(),
    fetchServicesNotifications: vi.fn(),
    fetchTipsAndNotifications: async () => {
      return [mocks.MOCK_SOURCE_TIP];
    },
  };
});

describe('controller', () => {
  const servicesPrivate = servicesTipsByProfileType.private;
  const servicesCommercial = servicesTipsByProfileType.commercial;

  beforeAll(() => {
    Mockdate.set('2022-07-22');
  });

  beforeEach(() => {
    servicesTipsByProfileType.private = {
      BRP: async () => {
        return {
          content: {
            persoon: {
              geboortedatum: `${new Date().getFullYear() - 17}-06-06`,
            },
          },
        };
      },
    };

    servicesTipsByProfileType.commercial = {
      KVK: async () => {
        return {
          content: {
            onderneming: {
              datumAanvang: null,
              datumEinde: null,
              handelsnamen: ['Kruijff Sport', 'Local Streetplanet Eenmanszaak'],
              hoofdactiviteit: 'Caf\u00e9s',
              overigeActiviteiten: ['Jachthavens'],
              rechtsvorm: null,
              kvkNummer: '90006178',
            },
            vestigingen: [],
          },
        };
      },
    };
  });

  afterAll(() => {
    servicesTipsByProfileType.private = servicesPrivate;
    servicesTipsByProfileType.commercial = servicesCommercial;
    Mockdate.reset();
  });

  test('Get service results for private:digid tips', async () => {
    const reqMock = await getReqMockWithOidc({
      sid: 'x123y',
      authMethod: 'digid',
      profileType: 'private',
      id: '9988',
    });

    const results = await forTesting.getServiceResultsForTips(
      'xx12xx',
      reqMock
    );

    expect(results).toMatchInlineSnapshot(`
      {
        "BRP": {
          "content": {
            "persoon": {
              "geboortedatum": "2005-06-06",
            },
          },
        },
      }
    `);
  });

  test('Get service results for private:eherkenning tips', async () => {
    const reqMock = await getReqMockWithOidc({
      id: '90006178',
      profileType: 'commercial',
      authMethod: 'eherkenning',
      sid: '',
    });
    const results2 = await forTesting.getServiceResultsForTips(
      'xx12xx',
      reqMock
    );

    expect(results2).toMatchInlineSnapshot(`
      {
        "KVK": {
          "content": {
            "onderneming": {
              "datumAanvang": null,
              "datumEinde": null,
              "handelsnamen": [
                "Kruijff Sport",
                "Local Streetplanet Eenmanszaak",
              ],
              "hoofdactiviteit": "Cafés",
              "kvkNummer": "90006178",
              "overigeActiviteiten": [
                "Jachthavens",
              ],
              "rechtsvorm": null,
            },
            "vestigingen": [],
          },
        },
      }
    `);
  });

  test('addServiceResultHandler', async () => {
    const resMock = ResponseMock.new();
    const data = { X: apiSuccessResult({ foo: 'bar' }) };
    const servicePromise = Promise.resolve(data);

    const result = await addServiceResultHandler(
      resMock,
      servicePromise,
      'test-service'
    );

    expect(resMock.write).toHaveBeenCalledWith(
      `event: message\nid: test-service\ndata: {"X":{"content":{"foo":"bar"},"status":"OK"}}\n\n`
    );

    expect(result).toEqual(data);
  });
});

describe('request handlers', () => {
  describe('CMS_CONTENT', async () => {
    const reqID = 'xx-req-id-yy';

    test('profileType: private', async () => {
      const reqMock = await getReqMockWithOidc({
        sid: 'x123y',
        authMethod: 'digid',
        profileType: 'private',
        id: '9988',
      });

      await forTesting.CMS_CONTENT(reqID, reqMock);

      expect(fetchCMSCONTENT).toHaveBeenCalledWith(reqID, {
        profileType: 'private',
      });
    });

    test('profileType: commercial', async () => {
      const reqMock = await getReqMockWithOidc({
        sid: 'x123y',
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: '9988',
      });

      await forTesting.CMS_CONTENT(reqID, reqMock);

      expect(fetchCMSCONTENT).toHaveBeenCalledWith(reqID, {
        profileType: 'commercial',
      });
    });

    test('arbitrary query params are passed', async () => {
      const reqMock = await getReqMockWithOidc({
        sid: 'x123y',
        authMethod: 'eherkenning',
        profileType: 'commercial',
        id: '9988',
      });

      (reqMock as unknown as RequestMock).setQuery({ forceRenew: 'true' });

      await forTesting.CMS_CONTENT(reqID, reqMock);

      expect(fetchCMSCONTENT).toHaveBeenCalledWith(reqID, {
        profileType: 'commercial',
        forceRenew: 'true',
      });
    });
  });
});
