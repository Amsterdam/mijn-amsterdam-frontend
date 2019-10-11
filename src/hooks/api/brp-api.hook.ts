import { ApiUrls } from 'App.constants';
import { ProfileData } from 'data-formatting/brp';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';

export type BrpApiState = ApiState & { data: ProfileData | {} };

export function useBrpApi(initialState = {}): BrpApiState {
  const options = { url: ApiUrls.BRP };
  const [api] = useDataApi(options, initialState);
  const { data, ...rest } = api;
  const brpData = data && data.persoon ? data : {};

  return { ...rest, data: brpData };
}
