import { ApiConfig, ApiUrls } from 'App.constants';
import { formatWmoApiResponse, WmoItem } from 'data-formatting/wmo';
import { ApiState } from './api.types';
import usePaginatedApi, { PaginatedItemsResponse } from './paginated-api.hook';

export interface WmoApiState extends ApiState {
  data: PaginatedItemsResponse & {
    items: WmoItem[];
  };
}

export default (offset?: number, limit?: number): WmoApiState => {
  const { data, ...rest } = usePaginatedApi(
    ApiUrls.WMO,
    offset,
    limit,
    ApiConfig[ApiUrls.WMO].postponeFetch
  );

  const items = Array.isArray(data.items)
    ? formatWmoApiResponse(data.items)
    : [];

  return {
    ...rest,
    data: {
      ...data,
      items,
    },
  };
};
