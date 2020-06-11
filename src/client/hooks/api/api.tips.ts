import { useCallback, useMemo } from 'react';
import { TIPSData } from '../../../server/services/tips';
import { BFFApiUrls } from '../../config/api';
import { useDataApi } from './api.hook';
import {
  ApiResponse,
  apiPristineResult,
  unwrapResponseContent,
} from '../../../universal/helpers/api';

function transformResponse(response: ApiResponse<TIPSData>) {
  return {
    TIPS: response,
  };
}

export function useTipsApi() {
  const pristineData = transformResponse(apiPristineResult(null));
  const [api, fetchTips] = useDataApi<{ TIPS: ApiResponse<TIPSData | null> }>(
    {
      url: BFFApiUrls.SERVICES_TIPS,
      postpone: true,
      transformResponse,
      // withCredentials: true,
    },
    pristineData
  );

  const fetchTipsFinal = useCallback(
    (isOptIn: boolean, appState: any) => {
      const requestData = unwrapResponseContent(appState);
      fetchTips({
        url: BFFApiUrls.SERVICES_TIPS,
        method: 'POST',
        data: {
          data: requestData,
          optin: isOptIn,
        },
        postpone: false,
      });
    },
    [fetchTips]
  );

  return useMemo(() => {
    return {
      ...api.data,
      fetch: fetchTipsFinal,
    };
  }, [api.data, fetchTipsFinal]);
}
