import { useCallback, useMemo } from 'react';
import { TIPSData } from '../../../server/services/tips';
import { ApiResponse } from '../../../universal/helpers/api';
import { PRISTINE_APPSTATE } from '../../AppState';
import { BFFApiUrls } from '../../config/api';
import { useDataApi } from './api.hook';

function transformResponse(response: ApiResponse<TIPSData>) {
  return {
    TIPS: response,
  };
}

export function useTipsApi() {
  const pristineData = transformResponse(PRISTINE_APPSTATE.TIPS);
  const [api, fetchTips] = useDataApi<{ TIPS: ApiResponse<TIPSData> }>(
    {
      url: BFFApiUrls.SERVICES_TIPS,
      postpone: true,
      transformResponse,
    },
    pristineData
  );

  const fetchTipsFinal = useCallback(
    (isOptIn: boolean) => {
      fetchTips({
        url: BFFApiUrls.SERVICES_TIPS,
        params: {
          optin: isOptIn,
        },
        postpone: false,
      });
    },
    [fetchTips]
  );

  return useMemo(() => {
    let responseData = api.data;
    if (api.isLoading) {
      const pristineData = transformResponse({ ...PRISTINE_APPSTATE.TIPS });
      responseData = pristineData;
    }
    return {
      ...responseData,
      fetch: fetchTipsFinal,
    };
  }, [api, fetchTipsFinal]);
}
