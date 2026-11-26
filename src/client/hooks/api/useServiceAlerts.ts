import type { ServiceAlert } from '../../../server/services/service-alerts/service-alerts.types.ts';
import {
  filterServiceAlerts,
  type ServiceAlertsFilter,
} from '../../../universal/helpers/service-alerts.ts';
import { BFFApiUrls } from '../../apps/bob/config/api.ts';
import { useAppStateGetter } from '../useAppStateStore.ts';
import { useBffApi } from './useBffApi.ts';

export function useServiceAlerts(
  filter: ServiceAlertsFilter,
  fromApiDirectly: boolean = false
) {
  const { SERVICE_ALERTS } = useAppStateGetter();
  const url = new URL(BFFApiUrls.SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL);
  url.searchParams.append('page', filter.page || '');
  const api = useBffApi<ServiceAlert[]>(
    fromApiDirectly ? url.toString() : null
  );

  const notifications = fromApiDirectly
    ? api.data?.content
    : SERVICE_ALERTS?.content;

  return filterServiceAlerts(notifications ?? [], filter);
}
