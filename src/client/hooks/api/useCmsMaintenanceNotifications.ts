import { useMemo } from 'react';
import { BFFApiUrls } from '../../config/api';
import { useDataApi } from './useDataApi';
import { CMSMaintenanceNotifications } from '../../../server/services/cms-maintenance-notifications';
import { ApiResponse } from '../../../universal/helpers';
import { apiPristineResult } from '../../../universal/helpers/api';

const requestConfig = {
  url: BFFApiUrls.SERVICES_CMS_MAINTENANCE_NOTIFICATIONS_URL,
};

export function useCmsMaintenanceNotifications(page?: string) {
  const requestConfigFinal = useMemo(() => {
    if (page) {
      return {
        ...requestConfig,
        url: requestConfig.url + '/' + page,
      };
    }
    return requestConfig;
  }, [page]);

  const [api] = useDataApi<ApiResponse<CMSMaintenanceNotifications>>(
    requestConfigFinal,
    apiPristineResult([])
  );

  return api.data.content;
}
