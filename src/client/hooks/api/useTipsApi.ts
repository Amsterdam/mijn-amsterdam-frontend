import { useEffect, useState } from 'react';
import { TIPSData } from '../../../server/services/tips';
import { ApiResponse } from '../../../universal/helpers/api';
import { AppState, PRISTINE_APPSTATE } from '../../AppState';
import { SERVICES_TIPS_URL } from '../../config/api';
import { useAppStateSetter } from '../useAppState';
import { useOptIn } from '../useOptIn';
import { useProfileTypeValue } from '../useProfileType';
import { useDataApi } from './useDataApi';

const pristineData = { TIPS: PRISTINE_APPSTATE.TIPS };

const requestConfig = {
  url: SERVICES_TIPS_URL,
  postpone: true,
};

export function useTipsApi() {
  const { isOptIn } = useOptIn();
  const profileType = useProfileTypeValue();
  const [api, fetchTips] = useDataApi<{ TIPS: ApiResponse<TIPSData> }>(
    requestConfig,
    pristineData
  );
  const setAppState = useAppStateSetter();
  const fetchTrigger = `${profileType}-${isOptIn}`;
  const [loadingTrigger, setLoadingTrigger] = useState<null | string>(
    fetchTrigger
  );

  useEffect(() => {
    if (fetchTrigger !== loadingTrigger) {
      setLoadingTrigger(fetchTrigger);
      fetchTips({
        ...requestConfig,
        params: {
          profileType,
          optin: isOptIn,
        },
      });
    }
  }, [isOptIn, fetchTrigger, loadingTrigger, fetchTips, profileType]);

  useEffect(() => {
    if (
      !api.isLoading &&
      api.isDirty &&
      api.data.TIPS !== PRISTINE_APPSTATE.TIPS
    ) {
      setAppState((appState: AppState) => {
        return Object.assign({}, appState, api.data);
      });
    } else {
      setAppState((appState: AppState) => {
        if (appState.TIPS !== pristineData.TIPS) {
          return Object.assign({}, appState, pristineData);
        }
        return appState;
      });
    }
  }, [api, setAppState]);
}
