import { useEffect } from 'react';
import { AppState, PRISTINE_APPSTATE } from '../../AppState';
import { SERVICES_CMS_URL } from '../../config/api';
import { useAppStateSetter } from '../useAppState';
import { useDataApi } from './useDataApi';

const pristineData = PRISTINE_APPSTATE.CMS_CONTENT;

export function useCMSApi(postpone: boolean = true) {
  const [api] = useDataApi<AppState['CMS_CONTENT']>(
    {
      url: SERVICES_CMS_URL,
      postpone,
    },
    pristineData
  );
  const setAppState = useAppStateSetter();

  useEffect(() => {
    if (
      !api.isLoading &&
      api.isDirty &&
      api.data !== PRISTINE_APPSTATE.CMS_CONTENT
    ) {
      setAppState((appState: AppState) => {
        return Object.assign({}, appState, { CMS_CONTENT: api.data });
      });
    }
  }, [api, setAppState]);

  return api;
}
