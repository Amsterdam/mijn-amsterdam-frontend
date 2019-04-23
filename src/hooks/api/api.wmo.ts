import { ApiUrls } from 'App.constants';
import paginatedApiHook, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiState } from './api.types';
import {
  formatWmoApiResponse,
  WmoItem,
  WmoApiResponse,
} from 'data-formatting/wmo';

export interface WmoApiState extends ApiState {
  data: {
    items: WmoItem[];
  };
}

export default (offset?: number, limit?: number): WmoApiState => {
  const { data, ...rest } = paginatedApiHook(ApiUrls.WMO, offset, limit);

  return {
    ...rest,
    data: {
      ...data,
      items: formatWmoApiResponse(data.items),
    },
  };
};
