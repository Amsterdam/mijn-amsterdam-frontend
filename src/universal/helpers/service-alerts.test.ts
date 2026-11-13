import { filterServiceAlerts } from './service-alerts.ts';

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

  it('matches other pages on path', () => {
    expect(
      ids(
        filterServiceAlerts(notifications, {
          page: 'notifications',
        })
      )
    ).toEqual(['notification']);
  });

  it('returns nothing without page or thema', () => {
    expect(filterServiceAlerts(notifications, {})).toEqual([]);
  });
});
