import { filterServiceAlerts, isServiceAlertsPage } from './service-alerts.ts';

const notifications = [
  { id: 'theme-avg', displayLocation: 'theme', themaID: 'AVG', path: '/AVG' },
  {
    id: 'dashboard',
    displayLocation: 'dashboard',
    themaID: 'NOTIFICATIONS',
  },
  {
    id: 'login',
    displayLocation: 'login',
    themaID: 'NOTIFICATIONS',
  },
  {
    id: 'notification',
    displayLocation: 'notification',
    themaID: 'NOTIFICATIONS',
  },
];

function ids(result: typeof notifications) {
  return result.map(({ id }) => id);
}

describe('filterServiceAlerts', () => {
  it('returns theme alerts for the given thema', () => {
    expect(ids(filterServiceAlerts(notifications, { themaID: 'AVG' }))).toEqual(
      ['theme-avg']
    );
  });

  it('prefers the thema over the page', () => {
    expect(
      ids(
        filterServiceAlerts(notifications, {
          page: 'dashboard',
          themaID: 'AVG',
        })
      )
    ).toEqual(['theme-avg']);
  });

  it('returns dashboard alerts for the dashboard page', () => {
    expect(
      ids(filterServiceAlerts(notifications, { page: 'dashboard' }))
    ).toEqual(['dashboard']);
  });

  it('returns login alerts for the login page', () => {
    expect(ids(filterServiceAlerts(notifications, { page: 'login' }))).toEqual([
      'login',
    ]);
  });

  it('returns nothing without page or thema', () => {
    expect(filterServiceAlerts(notifications, {})).toEqual([]);
  });
});

describe('isServiceAlertsPage', () => {
  it('accepts only pages that have their own alerts', () => {
    expect(isServiceAlertsPage('dashboard')).toBe(true);
    expect(isServiceAlertsPage('login')).toBe(true);
    expect(isServiceAlertsPage('afval')).toBe(false);
    expect(isServiceAlertsPage(undefined)).toBe(false);
  });
});
