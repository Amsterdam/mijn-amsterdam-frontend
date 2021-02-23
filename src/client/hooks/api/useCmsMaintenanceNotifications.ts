import { CMSMaintenanceNotification } from '../../../server/services/cms-maintenance-notifications';
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
      return notification.path === path;
    });
  }

  return api.data.content;
}
