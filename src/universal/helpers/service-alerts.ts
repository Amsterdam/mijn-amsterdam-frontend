import type { ServiceAlertThemaID } from '../../client/apps/bob/config/service-alert-themas.ts';

type FilterableServiceAlert = {
  displayLocation?: string;
  themaID: string;
};

export const SERVICE_ALERTS_PAGES = ['landingspagina'] as const;
export type ServiceAlertsPage = (typeof SERVICE_ALERTS_PAGES)[number];

export function isServiceAlertsPage(page: unknown): page is ServiceAlertsPage {
  return SERVICE_ALERTS_PAGES.includes(page as ServiceAlertsPage);
}

export type ServiceAlertsFilter =
  | { page: ServiceAlertsPage; themaID?: never }
  | { themaID: ServiceAlertThemaID; page?: never };

export function filterServiceAlerts<T extends FilterableServiceAlert>(
  notifications: T[],
  filter: ServiceAlertsFilter
): T[] {
  if (filter.themaID !== undefined) {
    const { themaID } = filter;
    return notifications.filter(
      (notification) =>
        notification.displayLocation === 'theme' &&
        notification.themaID === themaID
    );
  }

  return notifications.filter(
    (notification) => notification.displayLocation === filter.page
  );
}
