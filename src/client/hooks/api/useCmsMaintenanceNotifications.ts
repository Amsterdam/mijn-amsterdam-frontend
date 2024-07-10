import type { CMSMaintenanceNotification } from '../../../server/services/cms-maintenance-notifications';
import { ApiResponse, apiPristineResult } from '../../../universal/helpers/api';
import { BFFApiUrls } from '../../config/api';
import { useAppStateGetter } from '../useAppState';
import { useDataApi } from './useDataApi';

export function useCmsMaintenanceNotifications(
  page?: string,
  fromApiDirectly: boolean = false
) {
  const { CMS_MAINTENANCE_NOTIFICATIONS } = useAppStateGetter();
  const [api] = useDataApi<ApiResponse<CMSMaintenanceNotification[]>>(
    {
      url:
        BFFApiUrls.SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL +
        (page ? `?page=${page}` : ''),
      postpone: !fromApiDirectly,
    },
    apiPristineResult([])
  );

  const notifications = fromApiDirectly
    ? api.data?.content
    : CMS_MAINTENANCE_NOTIFICATIONS?.content;

  if (page) {
    return notifications?.filter((notification) => {
      return notification.path === `/${page}`;
    });
  }

  return [];
}
