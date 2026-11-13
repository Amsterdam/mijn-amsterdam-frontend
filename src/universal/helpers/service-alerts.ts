type FilterableServiceAlert = {
  displayLocation?: string;
  themaID: string;
};

export const SERVICE_ALERTS_PAGES = ['dashboard', 'login'] as const;
export type ServiceAlertsPage = (typeof SERVICE_ALERTS_PAGES)[number];

export function isServiceAlertsPage(page: unknown): page is ServiceAlertsPage {
  return SERVICE_ALERTS_PAGES.includes(page as ServiceAlertsPage);
}

export type ServiceAlertsFilter = {
  page?: ServiceAlertsPage;
  themaID?: string;
};

export function filterServiceAlerts<T extends FilterableServiceAlert>(
  notifications: T[],
  { page, themaID }: ServiceAlertsFilter
): T[] {
  if (themaID) {
    return notifications.filter(
      (notification) =>
        notification.displayLocation === 'theme' &&
        notification.themaID === themaID
    );
  }

  if (page) {
    return notifications.filter(
      (notification) => notification.displayLocation === page
    );
  }

  return [];
}
