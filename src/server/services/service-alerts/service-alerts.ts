import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { filterServiceAlerts } from '../../../universal/helpers/service-alerts.ts';
import { sanitizeCmsContent } from '../cms/cms-content.ts';
import type { ServiceAlertDisplayLocation } from '../db/schema/service-alerts.ts';
import { captureException } from '../monitoring.ts';
import {
  getActiveServiceAlertRows,
  type ServiceAlertRow,
} from './service-alerts.model.ts';
import type {
  QueryParamsServiceAlerts,
  ServiceAlert,
} from './service-alerts.types.ts';

const notificationsThemaId = 'NOTIFICATIONS';
const notificationsThemaTitle = 'Alle berichten';
const amsterdamDateTimeFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Amsterdam',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function getLocationPath(displayLocation: ServiceAlertDisplayLocation) {
  return {
    theme: '',
    dashboard: '/landingspagina',
    notification: '/notifications',
    login: '',
  }[displayLocation];
}

function getAmsterdamDateAndTime(date: Date) {
  const parts = Object.fromEntries(
    amsterdamDateTimeFormatter
      .formatToParts(date)
      .map(({ type, value }) => [type, value])
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`,
  };
}

function toServiceAlert(alert: ServiceAlertRow): ServiceAlert {
  const start = new Date(alert.dateStart);
  const end = new Date(alert.dateEnd);
  const startParts = getAmsterdamDateAndTime(start);
  const endParts = getAmsterdamDateAndTime(end);
  const isThemeAlert = alert.displayLocation === 'theme';

  return {
    id: alert.id,
    title: alert.title,
    description: sanitizeCmsContent(alert.body),
    datePublished: alert.dateUpdated.toISOString(),
    dateStart: startParts.date,
    dateEnd: endParts.date,
    timeStart: startParts.time,
    timeEnd: endParts.time,
    path: isThemeAlert
      ? `/${alert.themaId}`
      : getLocationPath(alert.displayLocation),
    themaID: isThemeAlert ? (alert.themaId ?? '') : notificationsThemaId,
    themaTitle: isThemeAlert ? (alert.themaId ?? '') : notificationsThemaTitle,
    severity: alert.type,
    isAlert: true,
    displayLocation: alert.displayLocation,
    links: alert.links
      .toSorted((a, b) => a.sortOrder - b.sortOrder)
      .map(({ label, url }) => ({ title: label, to: url })),
  };
}

async function getActiveServiceAlerts(): Promise<ServiceAlert[]> {
  try {
    const alerts = await getActiveServiceAlertRows();
    return alerts.map(toServiceAlert);
  } catch (error) {
    captureException(error);
    return [];
  }
}

// Without a page all active alerts are returned, e.g. for the app state. The frontend filters those per page.
export async function fetchActiveServiceAlerts(
  queryParams: QueryParamsServiceAlerts = {}
) {
  const alerts = await getActiveServiceAlerts();

  if (!queryParams.page) {
    return apiSuccessResult(alerts);
  }

  return apiSuccessResult(
    filterServiceAlerts(alerts, { page: queryParams.page })
  );
}

export async function fetchServiceAlertNotifications() {
  const alerts = await getActiveServiceAlerts();
  return apiSuccessResult({
    notifications: alerts.filter(
      ({ displayLocation }) => displayLocation === 'notification'
    ),
  });
}

export const forTesting = {
  toServiceAlert,
};
