import { useEffect, useRef } from 'react';
import { TIPSData } from '../../../server/services/tips';
import { ApiResponse } from '../../../universal/helpers/api';
import { AppState, PRISTINE_APPSTATE } from '../../AppState';
import { SERVICES_TIPS_URL } from '../../config/api';
import { useAppStateSetter } from '../useAppState';
import { useOptIn } from '../useOptIn';
import { useProfileTypeValue } from '../useProfileType';
import { useDataApi } from './useDataApi';

const pristineData = PRISTINE_APPSTATE.TIPS;

const requestConfig = {
  url: SERVICES_TIPS_URL,
  postpone: true,
};

export function useTipsApi() {
  const isInitialMount = useRef(true);
  const { isOptIn } = useOptIn();
  const profileType = useProfileTypeValue();
  const [api, fetchTips] = useDataApi<ApiResponse<TIPSData | null>>(
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
    if (!api.isLoading && api.isDirty && api.data !== PRISTINE_APPSTATE.TIPS) {
      setAppState((appState: AppState) => {
        return Object.assign({}, appState, { TIPS: api.data });
      });
    } else if (api.isLoading) {
      setAppState((appState: AppState) => {
        if (appState.TIPS !== pristineData) {
          return Object.assign({}, appState, { TIPS: pristineData });
        }
        return appState;
      });
    }
  }, [api, setAppState]);
}
