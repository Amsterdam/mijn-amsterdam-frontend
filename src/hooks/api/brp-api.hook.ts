import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';
import { ApiState } from './api.types';
import formatBrpApiResponse, { BrpDataFormatted } from 'data-formatting/brp';

export type BrpApiState = Omit<ApiState, 'data'> & BrpDataFormatted;

export const useBrpApi = (initialState = {}): BrpApiState => {
  const options = { url: ApiUrls.BRP };
  const [api] = useDataApi(options, initialState);
  const { data, ...rest } = api;

  const brpData = typeof data === 'object' ? formatBrpApiResponse(data) : {};

  return { ...rest, ...brpData };
};
