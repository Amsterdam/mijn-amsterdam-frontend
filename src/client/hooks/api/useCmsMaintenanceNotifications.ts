import type { MaintenanceNotification } from '../../../server/services/service-alerts/service-alerts.types.ts';
import { filterMaintenanceNotifications } from '../../../universal/helpers/maintenance-notifications.ts';
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
  const api = useBffApi<MaintenanceNotification[]>(
    fromApiDirectly ? url.toString() : null
  );

  const notifications = fromApiDirectly
    ? api.data?.content
    : CMS_MAINTENANCE_NOTIFICATIONS?.content;

  return filterMaintenanceNotifications(notifications ?? [], {
    page,
    themaID,
  });
}
