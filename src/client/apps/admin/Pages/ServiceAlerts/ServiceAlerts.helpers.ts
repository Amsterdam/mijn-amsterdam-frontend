import type { ServiceAlertsOverview } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import { isDateInFuture } from '../../../../../universal/helpers/date.ts';
import {
  serviceAlertDisplayLocations,
  serviceAlertThemas,
  serviceAlertTypes,
} from './ServiceAlertForm.constants.ts';

type ServiceAlert = ServiceAlertsOverview[number];

export function getServiceAlertTypeLabel(type: ServiceAlert['type']) {
  return serviceAlertTypes.find(({ value }) => value === type)?.label ?? type;
}

export function getServiceAlertDisplayLocationLabel(
  displayLocation: ServiceAlert['displayLocation'],
  themaId: ServiceAlert['themaId']
) {
  if (displayLocation !== 'theme') {
    return (
      serviceAlertDisplayLocations.find(
        ({ value }) => value === displayLocation
      )?.label ?? displayLocation
    );
  }

  const themaName =
    serviceAlertThemas.find(({ value }) => value === themaId)?.label ?? themaId;

  return themaName ? `Thema: ${themaName}` : 'Thema';
}

export function getServiceAlertGroups(
  overview: ServiceAlertsOverview,
  now: Date = new Date()
) {
  const groups = {
    active: [] as ServiceAlertsOverview,
    upcoming: [] as ServiceAlertsOverview,
    past: [] as ServiceAlertsOverview,
  };

  for (const serviceAlert of overview) {
    if (isDateInFuture(serviceAlert.dateStart, now)) {
      groups.upcoming.push(serviceAlert);
    } else if (isDateInFuture(serviceAlert.dateEnd, now)) {
      groups.active.push(serviceAlert);
    } else {
      groups.past.push(serviceAlert);
    }
  }

  return groups;
}
