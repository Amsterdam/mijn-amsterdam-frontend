import { IS_ACCEPTANCE, IS_PRODUCTION } from '../../../universal/config/env.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { sanitizeCmsContent } from '../cms/cms-content.ts';
import type {
  CMSMaintenanceNotification,
  QueryParamsMaintenanceNotifications,
} from '../cms/cms-types.ts';
import type { ServiceAlertDisplayLocation } from '../db/schema/service-alerts.ts';
import { getServiceAlerts } from './service-alerts.ts';

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

function getCurrentEnvironment() {
  if (IS_PRODUCTION) {
    return 'prod';
  }
  if (IS_ACCEPTANCE) {
    return 'acc';
  }
  return 'test';
}

function isActiveNow(dateStart: Date, dateEnd: Date, now: Date) {
  return dateStart <= now && now < dateEnd;
}

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

function toMaintenanceNotification(
  alert: Awaited<ReturnType<typeof getServiceAlerts>>[number]
): CMSMaintenanceNotification {
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

async function getActiveServiceAlerts(now = new Date()) {
  const alerts = await getServiceAlerts();

  return alerts
    .filter((alert) =>
      isActiveNow(new Date(alert.dateStart), new Date(alert.dateEnd), now)
    )
    .map(toMaintenanceNotification);
}

export async function fetchActiveMaintenanceNotifications(
  queryParams: QueryParamsMaintenanceNotifications
) {
  const alerts = await getActiveServiceAlerts();

  if (
    queryParams.page === 'dashboard' ||
    queryParams.page === 'landingspagina'
  ) {
    return apiSuccessResult(
      alerts.filter(({ displayLocation }) => displayLocation === 'dashboard')
    );
  }

  return apiSuccessResult(alerts);
}

export async function fetchMaintenanceNotificationsDashboard() {
  const alerts = await getActiveServiceAlerts();
  return apiSuccessResult({
    notifications: alerts.filter(
      ({ displayLocation }) => displayLocation === 'notification'
    ),
  });
}

export const forTesting = {
  getCurrentEnvironment,
  isActiveNow,
  toMaintenanceNotification,
};
