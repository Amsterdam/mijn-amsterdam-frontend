import { useEffect } from 'react';

import { BFFApiUrls } from '../../config/api';
import { useAppStateGetter } from '../useAppState';
import { createGetApiHook } from './useDataApi-v2';
import type { CMSMaintenanceNotification } from '../../../server/services/cms/cms-maintenance-notifications';

const useCmsMaintenanceNotificationsApi =
  createGetApiHook<CMSMaintenanceNotification[]>();

export function useCmsMaintenanceNotifications(
  page?: string,
  fromApiDirectly: boolean = false
) {
  const { CMS_MAINTENANCE_NOTIFICATIONS } = useAppStateGetter();
  const api = useCmsMaintenanceNotificationsApi();

  useEffect(() => {
    if (fromApiDirectly) {
      const url = new URL(
        BFFApiUrls.SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL
      );
      url.searchParams.append('page', page || '');
      api.fetch(url);
    }
  }, [fromApiDirectly, page]);

  const notifications = fromApiDirectly
    ? api.data?.content
    : CMS_MAINTENANCE_NOTIFICATIONS?.content;

  if (page) {
    return notifications?.filter(({ path }) => path === `/${page}`);
  }

  return [];
}
