import { CMSMaintenanceNotification } from '../../../server/services/cms-maintenance-notifications';
import { Chapters } from '../../../universal/config';
import { ApiResponse } from '../../../universal/helpers';
import { apiPristineResult } from '../../../universal/helpers/api';
import { BFFApiUrls } from '../../config/api';
import { useDataApi } from './useDataApi';

const requestConfig = {
  url: BFFApiUrls.SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL,
};

export function useCmsMaintenanceNotifications(path?: string) {
  const [api] = useDataApi<ApiResponse<CMSMaintenanceNotification[]>>(
    requestConfig,
    apiPristineResult([])
  );

  if (path) {
    return api.data.content?.filter((notification) => {
      return new URL(notification.url).pathname === path;
    });
  }

  return api.data.content;
}

export function useMaintenanceNotificationsDashboard() {
  const maintenanceNotifications = useCmsMaintenanceNotifications('/dashboard');

  if (!maintenanceNotifications?.length) {
    return null;
  }

  return maintenanceNotifications.map((notification) => {
    return {
      id: `maintenance-${notification.url}`,
      chapter: Chapters.NOTIFICATIONS,
      isAlert: true,
      datePublished: new Date().toISOString(),
      title: notification.title,
      description: notification.description,
    };
  });
}
