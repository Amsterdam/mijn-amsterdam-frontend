import { filterMaintenanceNotifications } from './maintenance-notifications.ts';

const notifications = [
  { id: 'theme-avg', displayLocation: 'theme', themaID: 'AVG', path: '/AVG' },
  {
    id: 'dashboard',
    displayLocation: 'dashboard',
    themaID: 'NOTIFICATIONS',
    path: '/landingspagina',
  },
  {
    id: 'login',
    displayLocation: 'login',
    themaID: 'NOTIFICATIONS',
    path: '',
  },
  {
    id: 'notification',
    displayLocation: 'notification',
    themaID: 'NOTIFICATIONS',
    path: '/notifications',
  },
];

function ids(result: typeof notifications) {
  return result.map(({ id }) => id);
}

describe('filterMaintenanceNotifications', () => {
  it('returns theme alerts for the given thema', () => {
    expect(
      ids(filterMaintenanceNotifications(notifications, { themaID: 'AVG' }))
    ).toEqual(['theme-avg']);
  });

  it('prefers the thema over the page', () => {
    expect(
      ids(
        filterMaintenanceNotifications(notifications, {
          page: 'dashboard',
          themaID: 'AVG',
        })
      )
    ).toEqual(['theme-avg']);
  });

  it('returns dashboard alerts for the dashboard page', () => {
    expect(
      ids(filterMaintenanceNotifications(notifications, { page: 'dashboard' }))
    ).toEqual(['dashboard']);
  });

  it('returns login alerts for the login page', () => {
    expect(
      ids(filterMaintenanceNotifications(notifications, { page: 'login' }))
    ).toEqual(['login']);
  });

  it('matches other pages on path', () => {
    expect(
      ids(
        filterMaintenanceNotifications(notifications, {
          page: 'notifications',
        })
      )
    ).toEqual(['notification']);
  });

  it('returns nothing without page or thema', () => {
    expect(filterMaintenanceNotifications(notifications, {})).toEqual([]);
  });
});
