import type { DateRange } from '@amsterdam/design-system-react';

import type { ServiceAlertsOverview } from '../../../../../server/services/service-alerts/service-alerts.types.ts';
import {
  dateFormat,
  isDateInFuture,
} from '../../../../../universal/helpers/date.ts';
import {
  serviceAlertDisplayLocations,
  serviceAlertThemas,
  serviceAlertTypes,
} from './ServiceAlertForm.constants.ts';

type ServiceAlert = ServiceAlertsOverview[number];

export function getServiceAlertPreviewPeriod(
  dateRange: DateRange | undefined,
  timeStart: string | undefined,
  timeEnd: string | undefined
) {
  const startDate = dateRange?.start;
  const endDate = dateRange?.end;

  if (!startDate || !endDate || !timeStart || !timeEnd) {
    return null;
  }

  if (
    dateFormat(startDate, 'yyyy-MM-dd') === dateFormat(endDate, 'yyyy-MM-dd')
  ) {
    return `Getoond op ${dateFormat(startDate, 'EEEE d MMMM')} van ${timeStart} tot ${timeEnd}`;
  }

  return `Getoond van ${dateFormat(startDate, 'EEEE d MMMM')} om ${timeStart} tot ${dateFormat(endDate, 'EEEE d MMMM')} om ${timeEnd}`;
}

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
