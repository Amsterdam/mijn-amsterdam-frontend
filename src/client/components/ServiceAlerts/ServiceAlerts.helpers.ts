import type { ServiceAlertsOverview } from '../../../server/services/service-alerts/service-alerts.types.ts';
import { myThemasMenuItems } from '../../apps/bob/config/thema.ts';

const serviceAlertTypeLabels = {
  info: 'Informatie',
  warning: 'Waarschuwing',
  error: 'Storing',
} as const satisfies Record<ServiceAlertsOverview[number]['type'], string>;

const serviceAlertDisplayLocationLabels = {
  dashboard: 'Dashboard',
  notification: 'Notificatie',
} as const satisfies Record<
  Exclude<ServiceAlertsOverview[number]['displayLocation'], 'theme'>,
  string
>;

export function getServiceAlertTypeLabel(
  type: ServiceAlertsOverview[number]['type']
) {
  return serviceAlertTypeLabels[type];
}

export function getServiceAlertDisplayLocationLabel(
  displayLocation: ServiceAlertsOverview[number]['displayLocation'],
  themaId: ServiceAlertsOverview[number]['themaId']
) {
  if (displayLocation !== 'theme') {
    return serviceAlertDisplayLocationLabels[displayLocation];
  }

  const thema = myThemasMenuItems.find((item) => item.id === themaId);
  const themaName = typeof thema?.title === 'string' ? thema.title : themaId;

  return themaName ? `Thema: ${themaName}` : 'Thema';
}

export function getServiceAlertGroups(
  overview: ServiceAlertsOverview,
  now: Date = new Date()
) {
  const nowTimestamp = now.getTime();

  return overview.reduce(
    (groups, serviceAlert) => {
      const dateStart = new Date(serviceAlert.dateStart).getTime();
      const dateEnd = new Date(serviceAlert.dateEnd).getTime();

      if (dateStart <= nowTimestamp && dateEnd >= nowTimestamp) {
        groups.active.push(serviceAlert);
      } else if (dateStart > nowTimestamp) {
        groups.upcoming.push(serviceAlert);
      } else {
        groups.past.push(serviceAlert);
      }

      return groups;
    },
    {
      active: [] as ServiceAlertsOverview,
      upcoming: [] as ServiceAlertsOverview,
      past: [] as ServiceAlertsOverview,
    }
  );
}
