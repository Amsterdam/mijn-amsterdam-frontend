import type { CMSMaintenanceNotification } from '../../../server/services/cms/cms-types.ts';
import { BFFApiUrls } from '../../apps/bob/config/api.ts';
import { useAppStateGetter } from '../useAppStateStore.ts';
import { useBffApi } from './useBffApi.ts';

export function useCmsMaintenanceNotifications(
  page: string | undefined,
  themaID?: string,
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

  if (themaID) {
    return notifications?.filter(
      (notification) =>
        notification.displayLocation === 'theme' &&
        notification.themaID === themaID
    );
  }

  if (page === 'dashboard') {
    return notifications?.filter(
      (notification) => notification.displayLocation === 'dashboard'
    );
  }

  if (page === 'login') {
    return notifications?.filter(
      (notification) => notification.displayLocation === 'login'
    );
  }

  if (page) {
    return notifications?.filter(({ path }) => path === `/${page}`);
  }

  return [];
}
