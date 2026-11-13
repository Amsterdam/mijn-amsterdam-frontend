type FilterableMaintenanceNotification = {
  displayLocation?: string;
  themaID: string;
  path: string;
};

export type MaintenanceNotificationsFilter = {
  page?: string;
  themaID?: string;
};

export function filterMaintenanceNotifications<
  T extends FilterableMaintenanceNotification,
>(notifications: T[], { page, themaID }: MaintenanceNotificationsFilter): T[] {
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
