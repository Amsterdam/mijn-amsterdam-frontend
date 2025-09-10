import { BFFApiUrls } from '../../config/api';
import { useAppStateGetter } from '../useAppState';
import { useBffApi } from './useDataApi-v2';
import type { CMSMaintenanceNotification } from '../../../server/services/cms/cms-maintenance-notifications';

export function useCmsMaintenanceNotifications(
  page: string,
  fromApiDirectly: boolean = false
) {
  const { CMS_MAINTENANCE_NOTIFICATIONS } = useAppStateGetter();
  const url = new URL(BFFApiUrls.SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL);
  url.searchParams.append('page', page || '');
  const api = useBffApi<CMSMaintenanceNotification[]>(
    fromApiDirectly ? url.toString() : null
  );

  const notifications = fromApiDirectly
    ? api.data?.content
    : CMS_MAINTENANCE_NOTIFICATIONS?.content;

  if (page) {
    return notifications?.filter(({ path }) => path === `/${page}`);
  }

  return [];
}
