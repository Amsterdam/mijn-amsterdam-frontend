import type { ServiceAlert } from '../../../server/services/service-alerts/service-alerts.types.ts';
import {
  filterServiceAlerts,
  type ServiceAlertsPage,
} from '../../../universal/helpers/service-alerts.ts';
import { BFFApiUrls } from '../../apps/bob/config/api.ts';
import { useAppStateGetter } from '../useAppStateStore.ts';
import { useBffApi } from './useBffApi.ts';

export function useServiceAlerts(
  page: ServiceAlertsPage | undefined,
  themaID?: string,
  fromApiDirectly: boolean = false
) {
  const { CMS_MAINTENANCE_NOTIFICATIONS } = useAppStateGetter();
  const url = new URL(BFFApiUrls.SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL);
  url.searchParams.append('page', page || '');
  const api = useBffApi<ServiceAlert[]>(
    fromApiDirectly ? url.toString() : null
  );

  const notifications = fromApiDirectly
    ? api.data?.content
    : CMS_MAINTENANCE_NOTIFICATIONS?.content;

  return filterServiceAlerts(notifications ?? [], {
    page,
    themaID,
  });
}
