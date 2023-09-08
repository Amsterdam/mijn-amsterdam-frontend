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
import {
  getTipsFromServiceResults,
  servicesTipsByProfileType,
} from './controller';

const mocks = vi.hoisted(() => {
  return {
    MOCK_SOURCE_TIP: {
      profileTypes: ['private'],
      datePublished: '2022-06-15',
      description: 'Can we fake it today?',
      id: 'mijn-999',
      imgUrl: '/api/tips/static/tip_images/openresearch.jpg',
      isPersonalized: true,
      link: {
        title: 'Kijk op fake.amsterdam',
        to: 'https://fake.amsterdam/',
      },
      priority: 70,
      reason: ['Omdat dit een fake tip is.'],
      title: 'Voor fake Amsterdammers',
    },
  };
});

vi.mock('./tips-and-notifications', async () => {
  return {
    getTipsAndNotificationsFromApiResults: vi.fn(),
    sortNotifications: vi.fn(),
    fetchServicesNotifications: vi.fn(),
    fetchTipsAndNotifications: async () => {
      return {
        NOTIFICATIONS: { content: [] },
        TIPS: { content: [mocks.MOCK_SOURCE_TIP] },
      };
    },
  };
});

vi.mock('../helpers/app', async (requireActual) => {
  const origModule = (await requireActual()) as object;
  return {
    ...origModule,
    getAuth: async () => {
      return {
        profile: { id: '123456789', profileType: 'private', authMethod: '' },
        token: 'xxx==',
      };
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

  test('Only persoonlijke tips, not opted-in', async () => {
    const results = await getTipsFromServiceResults('xx12xx', {
      query: {
        optin: 'false',
        profileType: 'private',
      },
      cookies: {},
    } as any);

    expect(results.content?.some((tip) => tip.id === 'mijn-14')).toBe(true);
    expect(results.content?.every((tip) => tip.isPersonalized)).toBe(false);
    expect(
      results.content?.every((tip) => tip.profileTypes?.includes('private'))
    ).toBe(true);
  });

  test('Only zakelijke tips, not opted-in', async () => {
    const results = await getTipsFromServiceResults('xx12xx', {
      query: {
        optin: 'false',
        profileType: 'commercial',
      },
      cookies: {},
    } as any);

    expect(results.content?.some((tip) => tip.id === 'mijn-14')).toBe(false);
    expect(results.content?.some((tip) => tip.id === 'mijn-20')).toBe(true);

    expect(results.content?.every((tip) => tip.isPersonalized)).toBe(false);
    expect(
      results.content?.every((tip) => tip.profileTypes?.includes('commercial'))
    ).toBe(true);
  });

  test('Only persoonlijke tips, opted-in', async () => {
    const results = await getTipsFromServiceResults('xx12xx2', {
      query: {
        optin: 'true',
        profileType: 'private',
      },
      cookies: {},
    } as any);

    expect(results.content?.some((tip) => tip.id === 'mijn-14')).toBe(false);
    expect(results.content?.some((tip) => tip.id === 'mijn-28')).toBe(true);
    expect(results.content?.every((tip) => tip.isPersonalized)).toBe(true);
    expect(
      results.content?.every((tip) => tip.profileTypes?.includes('private'))
    ).toBe(true);
  });
});
