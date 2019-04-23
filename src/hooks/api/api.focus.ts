import { ApiUrls } from 'App.constants';
import paginatedApiHook, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiHookState } from './api.types';
import formatFocusApiResponse, { FocusItem } from 'data-formatting/focus';

export interface FocusResponse extends PaginatedItemsResponse {
  items: FocusItem[];
}

export interface FocusApiState extends ApiHookState {
  data: FocusResponse;
}

export default function useFocusApi(
  offset?: number,
  limit?: number
): FocusApiState {
  const { data, ...rest } = paginatedApiHook(ApiUrls.FOCUS, offset, limit);

  return {
    ...rest,
    data: {
      ...data,
      items: formatFocusApiResponse(data.items),
    },
  };
}
