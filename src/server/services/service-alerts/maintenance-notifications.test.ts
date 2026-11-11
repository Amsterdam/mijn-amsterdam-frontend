import mockdate from 'mockdate';

import {
  fetchActiveMaintenanceNotifications,
  fetchMaintenanceNotificationsDashboard,
  forTesting,
} from './maintenance-notifications.ts';
import { getServiceAlerts } from './service-alerts.ts';

vi.mock('./service-alerts.ts', () => ({
  getServiceAlerts: vi.fn(),
}));

const NOW = new Date('2026-11-10T12:00:00.000Z');

function createServiceAlert(
  overrides: Partial<Awaited<ReturnType<typeof getServiceAlerts>>[number]> = {}
): Awaited<ReturnType<typeof getServiceAlerts>>[number] {
  return {
    id: 'alert-id',
    title: 'Storing',
    body: '<p>Er is een storing.</p>',
    type: 'warning',
    displayLocation: 'notification',
    themaId: null,
    createdByEmail: 'maker@example.com',
    updatedByEmail: 'bewerker@example.com',
    links: [],
    environment: 'test',
    dateStart: new Date('2026-11-10T11:00:00.000Z'),
    dateEnd: new Date('2026-11-10T13:00:00.000Z'),
    dateUpdated: NOW,
    dateCreated: NOW,
    ...overrides,
  };
}

describe('service alert maintenance notifications', () => {
  beforeEach(() => {
    mockdate.set(NOW);
    vi.mocked(getServiceAlerts).mockResolvedValue([]);
  });

  afterEach(() => {
    mockdate.reset();
    vi.clearAllMocks();
  });

  it('returns only dashboard alerts for the dashboard banner', async () => {
    vi.mocked(getServiceAlerts).mockResolvedValue([
      createServiceAlert({ displayLocation: 'dashboard' }),
      createServiceAlert({
        id: 'notification',
        displayLocation: 'notification',
      }),
    ]);

    const result = await fetchActiveMaintenanceNotifications({
      page: 'dashboard',
    });

    expect(result.content?.map(({ id }) => id)).toEqual(['alert-id']);
  });

  it('returns notification alerts for the existing notifications feed', async () => {
    vi.mocked(getServiceAlerts).mockResolvedValue([
      createServiceAlert({ displayLocation: 'dashboard' }),
      createServiceAlert({
        id: 'notification',
        displayLocation: 'notification',
      }),
    ]);

    const result = await fetchMaintenanceNotificationsDashboard();

    expect(result.content?.notifications?.map(({ id }) => id)).toEqual([
      'notification',
    ]);
  });

  it('includes theme alerts and filters out expired and other-environment alerts', async () => {
    vi.mocked(getServiceAlerts).mockResolvedValue([
      createServiceAlert({ displayLocation: 'theme', themaId: 'AVG' }),
      createServiceAlert({
        id: 'expired',
        dateEnd: new Date('2026-11-10T11:00:00.000Z'),
      }),
      createServiceAlert({
        id: 'wrong-environment',
        environment: 'prod',
      }),
    ]);

    const result = await fetchActiveMaintenanceNotifications({ page: 'avg' });

    expect(result.content?.map(({ id }) => id)).toEqual(['alert-id']);
    expect(result.content?.[0].themaID).toBe('AVG');
  });

  it('converts alert timestamps to Amsterdam local dates and times', () => {
    const notification = forTesting.toMaintenanceNotification(
      createServiceAlert({
        dateStart: new Date('2026-01-01T23:30:00.000Z'),
        dateEnd: new Date('2026-01-02T00:30:00.000Z'),
      })
    );

    expect(notification).toMatchObject({
      dateStart: '2026-01-02',
      timeStart: '00:30',
      dateEnd: '2026-01-02',
      timeEnd: '01:30',
      displayLocation: 'notification',
    });
  });

  it('converts all links in sort order for the frontend', () => {
    const notification = forTesting.toMaintenanceNotification(
      createServiceAlert({
        links: [
          {
            label: 'Second link',
            url: 'https://example.com/second',
            sortOrder: 1,
          },
          {
            label: 'First link',
            url: 'https://example.com/first',
            sortOrder: 0,
          },
        ],
      })
    );

    expect(notification.links).toEqual([
      { title: 'First link', to: 'https://example.com/first' },
      { title: 'Second link', to: 'https://example.com/second' },
    ]);
  });
});
