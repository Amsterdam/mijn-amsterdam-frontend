import { ApiUrls } from 'App.constants';
import usePaginatedApi, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiState } from './api.types';
import formatFocusApiResponse, { FocusItem } from 'data-formatting/focus';

export interface FocusResponse extends PaginatedItemsResponse {
  items: FocusItem[];
}

export interface FocusApiState extends ApiState {
  data: FocusResponse;
}

export default function useFocusApi(
  offset?: number,
  limit?: number
): FocusApiState {
  const { data, ...rest } = usePaginatedApi(ApiUrls.FOCUS, offset, limit);

  return {
    ...rest,
    data: {
      ...data,
      items: formatFocusApiResponse(data.items),
    },
  };
}
