import { useEffect, useState } from 'react';
import { TIPSData } from '../../../server/services/tips';
import { ApiResponse } from '../../../universal/helpers/api';
import { PRISTINE_APPSTATE } from '../../AppState';
import { BFFApiUrls } from '../../config/api';
import { useAppStateGetter, useAppStateSetter } from '../useAppState';
import { useOptIn } from '../useOptIn';
import { requestApiData, useDataApi } from './useDataApi';

function transformResponse(response: ApiResponse<TIPSData>) {
  return {
    TIPS: response,
  };
}

const pristineData = transformResponse(PRISTINE_APPSTATE.TIPS);

export function useTipsApi() {
  const { isOptIn } = useOptIn();
  const [prevOptIn, setPrevOptIn] = useState(isOptIn);
  const setAppState = useAppStateSetter();
  const appState = useAppStateGetter();
  const [api, fetchTips] = useDataApi<{ TIPS: ApiResponse<TIPSData> }>(
    {
      url: BFFApiUrls.SERVICES_TIPS,
      postpone: true,
      transformResponse: [
        ...requestApiData.defaults.transformResponse,
        transformResponse,
      ],
    },
    pristineData
  );

  useEffect(() => {
    if (prevOptIn !== isOptIn && !api.isLoading) {
      setPrevOptIn(isOptIn);
      fetchTips({
        url: BFFApiUrls.SERVICES_TIPS,
        postpone: false,
      });
    }
  }, [isOptIn, prevOptIn, fetchTips, api.isLoading]);

  useEffect(() => {
    if (api.isLoading && appState.TIPS !== pristineData.TIPS) {
      setAppState(Object.assign({}, appState, pristineData));
    } else if (
      !api.isLoading &&
      api.isDirty &&
      appState.TIPS !== api.data.TIPS
    ) {
      setAppState(Object.assign({}, appState, api.data));
    }
  }, [api, appState, setAppState]);
}
