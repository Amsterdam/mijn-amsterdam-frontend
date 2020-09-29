import { useEffect, useRef } from 'react';
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
  const isInitialMount = useRef(true);
  const { isOptIn } = useOptIn();
  const profileType = useProfileTypeValue();
  const [api, fetchTips] = useDataApi<{ TIPS: ApiResponse<TIPSData> }>(
    requestConfig,
    pristineData
  );
  const setAppState = useAppStateSetter();

  useEffect(() => {
    if (!isInitialMount.current) {
      fetchTips({
        ...requestConfig,
        params: {
          profileType,
          optin: isOptIn,
        },
      });
    }
    isInitialMount.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOptIn, fetchTips]);

  useEffect(() => {
    if (
      !api.isLoading &&
      api.isDirty &&
      api.data.TIPS !== PRISTINE_APPSTATE.TIPS
    ) {
      setAppState((appState: AppState) => {
        return Object.assign({}, appState, api.data);
      });
    } else if (api.isDirty) {
      setAppState((appState: AppState) => {
        if (appState.TIPS !== pristineData.TIPS) {
          return Object.assign({}, appState, pristineData);
        }
        return appState;
      });
    }
  }, [api, setAppState]);
}
