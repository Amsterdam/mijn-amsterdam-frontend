import { ApiUrls } from 'App.constants';
import { formatProfileData, ProfileData } from 'data-formatting/brp';
import { useMemo } from 'react';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';

export type BrpApiState = ApiState & { data: ProfileData | {} };

export function useBrpApi(initialState = {}): BrpApiState {
  const options = { url: ApiUrls.BRP };
  const [api] = useDataApi(options, initialState);
  const { data, ...rest } = api;

  const brpData = useMemo(() => {
    return data && data.persoon ? formatProfileData(data) : {};
  }, [data]);

  return { ...rest, data: brpData };
}
