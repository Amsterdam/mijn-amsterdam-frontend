import {
  fetchZWDNotifications,
  forTesting,
} from './zwd-notifications.ts';
import type { VvEDataFrontend } from './zwd.types.ts';
import { themaConfig } from '../../../client/pages/Thema/Profile/Profile-thema-config.ts';
import { getAuthProfileAndToken } from '../../../testing/utils.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';

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
    activationTeam: {
      type: 'Team',
      subject: 'Opstart',
      meetingDate: '2026-06-04',
    },
    adviceType: 'Verduurzamingsadvies',
    applicationType: 'Aanvraag',
    created: '2026-05-01T09:00:00.000Z',
    endDate: '2026-06-02',
    homeownerAssociation: {
      id: 555,
      name: 'VvE Prachtige Straat 13',
      district: 'Centrum',
      neighborhood: 'Grachtengordel',
      numberOfApartments: 21,
    },
    id: 101,
    legacyId: 'L-101',
    prefixedDossierId: 'ZWD-101',
    requestDate: '2026-05-02',
    status: 'In behandeling',
    updated: '2026-06-03T09:50:53.447114Z',
    ...overrides,
  };
}

describe('zwd-notifications', () => {
  const authProfileAndToken = getAuthProfileAndToken();
  const zwdToggle = themaConfig.BRP.featureToggle as {
    enableZWDZaken: boolean;
  };

  beforeEach(() => {
    fetchVVEDataMock.mockReset();
    zwdToggle.enableZWDZaken = true;
  });

  test('transformZWDCasesToNotifications maps case shape', () => {
    const notifications = forTesting.transformZWDCasesToNotifications([
      createZwdCase(),
    ]);

    expect(notifications).toEqual([
      {
        id: 'wonen-zwd-101-notification',
        themaID: themaConfig.BRP.id,
        themaTitle: themaConfig.BRP.title,
        title: 'Verduurzamingsadvies',
        description: 'VvE Prachtige Straat 13',
        datePublished: '2026-06-03T09:50:53.447114Z',
        link: {
          to: themaConfig.BRP.detailPageVvE.route.path,
          title: 'Bekijk uw aanvraag',
        },
      },
    ]);
  });

  test('fetchZWDNotifications returns empty list when enableZWDZaken is false', async () => {
    zwdToggle.enableZWDZaken = false;

    const result = await fetchZWDNotifications(authProfileAndToken);

    expect(fetchVVEDataMock).not.toHaveBeenCalled();
    expect(result).toEqual(apiSuccessResult({ notifications: [] }));
  });

  test('fetchZWDNotifications maps notifications from fetched VvE cases', async () => {
    fetchVVEDataMock.mockResolvedValue(
      apiSuccessResult({
        cases: [createZwdCase()],
      } as VvEDataFrontend)
    );

    const result = await fetchZWDNotifications(authProfileAndToken);

    expect(result.status).toBe('OK');
    expect(result.content.notifications).toHaveLength(1);
    expect(result.content.notifications[0]).toMatchInlineSnapshot(`
      {
        "datePublished": "2026-06-03T09:50:53.447114Z",
        "description": "VvE Prachtige Straat 13",
        "id": "wonen-zwd-101-notification",
        "link": {
          "title": "Bekijk uw aanvraag",
          "to": "/persoonlijke-gegevens/vve",
        },
        "themaID": "BRP",
        "themaTitle": "Mijn gegevens",
        "title": "Verduurzamingsadvies",
      }
    `);
  });
});
