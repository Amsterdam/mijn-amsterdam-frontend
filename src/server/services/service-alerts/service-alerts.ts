import {
  themaId as notificationsThemaId,
  themaTitle as notificationsThemaTitle,
} from '../../../client/apps/bob/pages/MyNotifications/MyNotifications-config.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { dateFormat, isoDateFormat } from '../../../universal/helpers/date.ts';
import {
  filterServiceAlerts,
  isServiceAlertsPage,
} from '../../../universal/helpers/service-alerts.ts';
import { sanitizeCmsContent } from '../cms/cms-content.ts';
import { captureException } from '../monitoring.ts';
import {
  getActiveServiceAlertRows,
  type ServiceAlertRow,
} from './service-alerts.model.ts';
import type {
  QueryParamsServiceAlerts,
  ServiceAlert,
} from './service-alerts.types.ts';

const TIME_FORMAT = 'HH:mm';

function toServiceAlert(alert: ServiceAlertRow): ServiceAlert {
  const isThemeAlert = alert.displayLocation === 'theme';

  return {
    id: alert.id,
    title: alert.title,
    description: sanitizeCmsContent(alert.body),
    datePublished: alert.dateUpdated.toISOString(),
    dateStart: isoDateFormat(alert.dateStart),
    dateEnd: isoDateFormat(alert.dateEnd),
    timeStart: dateFormat(alert.dateStart, TIME_FORMAT),
    timeEnd: dateFormat(alert.dateEnd, TIME_FORMAT),
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

export async function fetchActiveServiceAlerts(
  queryParams: QueryParamsServiceAlerts = {}
) {
  const { page } = queryParams;

  if (!page) {
    return apiSuccessResult(await getActiveServiceAlerts());
  }

  if (!isServiceAlertsPage(page)) {
    return apiSuccessResult([]);
  }

  const alerts = await getActiveServiceAlerts();
  return apiSuccessResult(filterServiceAlerts(alerts, { page }));
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
