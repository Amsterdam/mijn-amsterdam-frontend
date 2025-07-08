import { CMSMaintenanceNotification } from '../../../server/services/cms/cms-maintenance-notifications.ts';
import {
  ApiResponse_DEPRECATED,
  apiPristineResult,
} from '../../../universal/helpers/api.ts';
import { BFFApiUrls } from '../../config/api.ts';
import { useAppStateGetter } from '../useAppState.ts';
import { useDataApi } from './useDataApi.ts';

export function useCmsMaintenanceNotifications(
  page?: string,
  fromApiDirectly: boolean = false
) {
  const { CMS_MAINTENANCE_NOTIFICATIONS } = useAppStateGetter();
  const [api] = useDataApi<
    ApiResponse_DEPRECATED<CMSMaintenanceNotification[]>
  >(
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
    return notifications?.filter(({ path }) => path === `/${page}`);
  }

  return [];
}
