import { filterServiceAlerts, isServiceAlertsPage } from './service-alerts.ts';

const notifications = [
  { id: 'theme-avg', displayLocation: 'theme', themaID: 'AVG' },
  {
    id: 'landingspagina',
    displayLocation: 'landingspagina',
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

  it('returns landingspagina alerts for the landingspagina page', () => {
    expect(
      ids(filterServiceAlerts(notifications, { page: 'landingspagina' }))
    ).toEqual(['landingspagina']);
  });
});

describe('isServiceAlertsPage', () => {
  it('accepts only pages that have their own alerts', () => {
    expect(isServiceAlertsPage('landingspagina')).toBe(true);
    expect(isServiceAlertsPage('dashboard')).toBe(false);
    expect(isServiceAlertsPage('afval')).toBe(false);
    expect(isServiceAlertsPage(undefined)).toBe(false);
  });
});
