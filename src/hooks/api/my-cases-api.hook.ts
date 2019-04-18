import { ApiHookState } from './api.types';
import { FocusItem } from 'data-formatting/focus';
import useFocusApiResponse from './api.focus';
import { PaginatedItemsResponse } from './paginated-api.hook';

export type MyCase = FocusItem; // NOTE: ATM we don't have any more cases.

export interface MyCasesResponse extends PaginatedItemsResponse {
  items: MyCase[];
}

export interface MyCasesApiState extends ApiHookState {
  data: MyCasesResponse;
}

export default (offset?: number, limit?: number): MyCasesApiState => {
  const { data, ...rest } = useFocusApiResponse(offset, limit);
  const items = data.items.filter(item => item.inProgress);
  return {
    data: {
      ...data,
      items,
      total: items.length,
    },
    ...rest,
  };
};
