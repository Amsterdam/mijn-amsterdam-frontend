import mockdate from 'mockdate';

import { captureException } from '../monitoring.ts';
import {
  getActiveServiceAlertRows,
  type ServiceAlertRow,
} from './service-alerts.model.ts';
import {
  fetchActiveServiceAlerts,
  fetchServiceAlertNotifications,
  forTesting,
} from './service-alerts.ts';

vi.mock('./service-alerts.model.ts', () => ({
  getActiveServiceAlertRows: vi.fn(),
}));

vi.mock('../monitoring.ts', () => ({
  captureException: vi.fn(),
}));

const NOW = new Date('2026-11-10T12:00:00.000Z');

function createServiceAlert(
  overrides: Partial<ServiceAlertRow> = {}
): ServiceAlertRow {
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
    vi.mocked(getActiveServiceAlertRows).mockResolvedValue([]);
  });

  afterEach(() => {
    mockdate.reset();
    vi.clearAllMocks();
  });

  it('returns only dashboard alerts for the dashboard banner', async () => {
    vi.mocked(getActiveServiceAlertRows).mockResolvedValue([
      createServiceAlert({ displayLocation: 'dashboard' }),
      createServiceAlert({
        id: 'notification',
        displayLocation: 'notification',
      }),
    ]);

    const result = await fetchActiveServiceAlerts({
      page: 'dashboard',
    });

    expect(result.content?.map(({ id }) => id)).toEqual(['alert-id']);
  });

  it('returns only login alerts for the login page', async () => {
    vi.mocked(getActiveServiceAlertRows).mockResolvedValue([
      createServiceAlert({ id: 'login', displayLocation: 'login' }),
      createServiceAlert({ displayLocation: 'dashboard' }),
      createServiceAlert({ displayLocation: 'theme', themaId: 'AVG' }),
    ]);

    const result = await fetchActiveServiceAlerts({
      page: 'login',
    });

    expect(result.content?.map(({ id }) => id)).toEqual(['login']);
  });

  it('returns no alerts for an unknown page', async () => {
    vi.mocked(getActiveServiceAlertRows).mockResolvedValue([
      createServiceAlert({ displayLocation: 'dashboard' }),
    ]);

    const result = await fetchActiveServiceAlerts({ page: 'afval' });

    expect(result.content).toEqual([]);
  });

  it('returns all active alerts when no page is given', async () => {
    vi.mocked(getActiveServiceAlertRows).mockResolvedValue([
      createServiceAlert({ id: 'login', displayLocation: 'login' }),
      createServiceAlert({ id: 'dashboard', displayLocation: 'dashboard' }),
    ]);

    const result = await fetchActiveServiceAlerts({});

    expect(result.content?.map(({ id }) => id)).toEqual(['login', 'dashboard']);
  });

  it('returns notification alerts for the existing notifications feed', async () => {
    vi.mocked(getActiveServiceAlertRows).mockResolvedValue([
      createServiceAlert({ displayLocation: 'dashboard' }),
      createServiceAlert({
        id: 'notification',
        displayLocation: 'notification',
      }),
    ]);

    const result = await fetchServiceAlertNotifications();

    expect(result.content?.notifications?.map(({ id }) => id)).toEqual([
      'notification',
    ]);
  });

  it('maps theme alerts to their thema', async () => {
    vi.mocked(getActiveServiceAlertRows).mockResolvedValue([
      createServiceAlert({ displayLocation: 'theme', themaId: 'AVG' }),
    ]);

    const result = await fetchActiveServiceAlerts({});

    expect(result.content?.map(({ id }) => id)).toEqual(['alert-id']);
    expect(result.content?.[0]).toMatchObject({
      themaID: 'AVG',
      path: '/AVG',
    });
  });

  it('returns no alerts and reports the error when the database fails', async () => {
    const error = new Error('Database unavailable');
    vi.mocked(getActiveServiceAlertRows).mockRejectedValue(error);

    const result = await fetchActiveServiceAlerts({});

    expect(result).toMatchObject({ status: 'OK', content: [] });
    expect(captureException).toHaveBeenCalledWith(error);
  });

  it('returns no dashboard notifications when the database fails', async () => {
    vi.mocked(getActiveServiceAlertRows).mockRejectedValue(new Error('Down'));

    const result = await fetchServiceAlertNotifications();

    expect(result).toMatchObject({
      status: 'OK',
      content: { notifications: [] },
    });
  });

  it('converts alert timestamps to Amsterdam local dates and times', () => {
    const notification = forTesting.toServiceAlert(
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
    const notification = forTesting.toServiceAlert(
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
