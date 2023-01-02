import { MyTip } from '../../universal/types';
import * as controller from './controller';

const MOCK_SOURCE_TIP: MyTip = {
  audience: ['persoonlijk'],
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
};

jest.mock('../helpers/app', () => ({
  ...jest.requireActual('../helpers/app'),
  getAuth: async () => {
    return {
      profile: { id: '123456789', profileType: 'private', authMethod: '' },
      token: 'xxx==',
    };
  },
}));

jest.mock('./tips-and-notifications', () => ({
  fetchTipsAndNotifications: async () => {
    return {
      NOTIFICATIONS: { content: [] },
      TIPS: { content: [MOCK_SOURCE_TIP] },
    };
  },
}));

describe('controller', () => {
  const servicesPrivate = controller.servicesTipsByProfileType.private;
  const servicesCommercial = controller.servicesTipsByProfileType.commercial;

  beforeAll(() => {
    jest
      .useFakeTimers('modern')
      .setSystemTime(new Date('2022-02-22').getTime());
  });

  beforeEach(() => {
    controller.servicesTipsByProfileType.private = {
      BRP: async () => {
        return {
          content: {
            persoon: {
              geboortedatum: `${new Date().getFullYear() - 18}-06-06`,
            },
          },
        };
      },
    };

    controller.servicesTipsByProfileType.commercial = {
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
    controller.servicesTipsByProfileType.private = servicesPrivate;
    controller.servicesTipsByProfileType.commercial = servicesCommercial;
    jest.useRealTimers();
  });

  test('Only persoonlijke tips, not opted-in', async () => {
    const results = await controller.getTipsFromServiceResults('xx12xx', {
      query: {
        optin: 'false',
        profileType: 'private',
      },
      cookies: {},
    } as any);

    expect(results.content?.some((tip) => tip.id === 'mijn-14')).toBe(true);
    expect(results.content?.every((tip) => tip.isPersonalized)).toBe(false);
    expect(
      results.content?.every((tip) => tip.audience?.includes('persoonlijk'))
    ).toBe(true);
  });

  test('Only zakelijke tips, not opted-in', async () => {
    const results = await controller.getTipsFromServiceResults('xx12xx', {
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
      results.content?.every((tip) => tip.audience?.includes('zakelijk'))
    ).toBe(true);
  });

  test('Only persoonlijke tips, opted-in', async () => {
    const results = await controller.getTipsFromServiceResults('xx12xx2', {
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
      results.content?.every((tip) => tip.audience?.includes('persoonlijk'))
    ).toBe(true);
  });
});
