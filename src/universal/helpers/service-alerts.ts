type FilterableServiceAlert = {
  displayLocation?: string;
  themaID: string;
  path: string;
};

export type ServiceAlertsFilter = {
  page?: string;
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

  if (page === 'dashboard' || page === 'login') {
    return notifications.filter(
      (notification) => notification.displayLocation === page
    );
  }

  if (page) {
    return notifications.filter(({ path }) => path === `/${page}`);
  }

  return [];
}
