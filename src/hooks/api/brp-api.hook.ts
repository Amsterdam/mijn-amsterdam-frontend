import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';
import { ApiHookState } from './api.types';
import formatBrpApiResponse, { BrpDataFormatted } from 'data-formatting/brp';

export type BrpApiState = Omit<ApiHookState, 'data'> & BrpDataFormatted;

export const useBrpApi = (initialState = {}): BrpApiState => {
  const options = { url: ApiUrls.BRP };
  const api = useDataApi(options, initialState);
  const { data, ...rest } = api;

  const brpData = formatBrpApiResponse(data);

  return { ...rest, ...brpData };
};
