import { CMSMaintenanceNotification } from '../../../server/services/cms-maintenance-notifications';
import { Chapters } from '../../../universal/config';
import { ApiResponse } from '../../../universal/helpers';
import { apiPristineResult } from '../../../universal/helpers/api';
import { BFFApiUrls } from '../../config/api';
import { useDataApi } from './useDataApi';
import { MyNotification } from '../../../universal/types/App.types';

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
      return notification.path === path;
    });
  }

  return api.data.content;
}

export function useMaintenanceNotificationsDashboard() {
  const maintenanceNotifications = useCmsMaintenanceNotifications('/dashboard');

  if (!maintenanceNotifications?.length) {
    return null;
  }

  return maintenanceNotifications.map((notification, index) => {
    const item: MyNotification = {
      id: `maintenance-${index}-${notification.title}`,
      chapter: Chapters.NOTIFICATIONS,
      isAlert: true,
      datePublished: notification.datePublished,
      hideDatePublished: true,
      title: notification.title,
      description: notification.description,
    };
    if (notification.moreInformation) {
      item.moreInformation = notification.moreInformation;
    }
    if (notification.link) {
      item.link = notification.link;
    }
    return item;
  });
}
