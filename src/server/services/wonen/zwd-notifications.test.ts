import { forTesting } from './zwd-notifications.ts';
import type { VvEDataFrontend } from './zwd.types.ts';

const { fetchVVEDataMock } = vi.hoisted(() => ({
  fetchVVEDataMock: vi.fn(),
}));

vi.mock('./zwd.ts', async (importOriginal) => {
  const actual: object = await importOriginal();
  return {
    ...actual,
    fetchVVEData: fetchVVEDataMock,
  };
});

function createZwdCase(
  overrides: Partial<VvEDataFrontend['cases'][number]> = {}
): VvEDataFrontend['cases'][number] {
  return {
    id: '1',
    title: 'title',
    steps: [],
    link: { to: '/persoonlijke-gegevens/vve', title: 'Bekijk uw aanvraag' },
    adviceType: 'Energieadvies',
    homeownerAssociation: {
      name: 'VvE Prachtige Straat 13',
    },
    displayStatus: 'In behandeling',
    status: 'In behandeling',
    dateStart: '2026-06-03T09:50:53.447114Z',
    formattedDateStart: '03-06-2026',
    dateUpdated: '2026-06-03T09:50:53.447114Z',
    datePublished: '2026-06-03T09:50:53.447114Z',
    ...overrides,
  };
}

describe('zwd-notifications', () => {
  beforeEach(() => {
    fetchVVEDataMock.mockReset();
  });

  test('transformZWDCasesToNotifications maps case shape', () => {
    const notification =
      forTesting.transformZWDCasesToNotifications(createZwdCase());

    expect(notification).toEqual({
      id: 'wonen-zwd-1-notification',
      themaID: 'BRP',
      themaTitle: 'Mijn gegevens',
      title: 'Aanvraag verduurzamingsadvies VVE in behandeling',
      description:
        'Wij hebben de aanvraag voor verduurzamingsadvies van de VVE VvE Prachtige Straat 13 in behandeling',
      datePublished: '2026-06-03T09:50:53.447114Z',
      link: {
        to: '/persoonlijke-gegevens/vve',
        title: 'Bekijk uw aanvraag',
      },
    });
  });
});
