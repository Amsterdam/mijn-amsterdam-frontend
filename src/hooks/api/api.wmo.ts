import { ApiUrls } from 'App.constants';
import usePaginatedApi, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiState } from './api.types';
import { formatWmoApiResponse, WmoItem } from 'data-formatting/wmo';

export interface WmoApiState extends ApiState {
  data: PaginatedItemsResponse & {
    items: WmoItem[];
  };
}

export default (offset?: number, limit?: number): WmoApiState => {
  const { data, ...rest } = usePaginatedApi(ApiUrls.WMO, offset, limit);

  return {
    ...rest,
    data: {
      ...data,
      items: Array.isArray(data.items) ? formatWmoApiResponse(data.items) : [],
    },
  };
};
