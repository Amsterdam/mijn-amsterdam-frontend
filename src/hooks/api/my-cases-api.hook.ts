import { ApiUrls } from 'App.constants';
import paginatedApiHook, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiHookState } from './api.types';
import formatFocusApiResponse, { MyCase } from 'data-formatting/focus';

export interface MyCasesResponse extends PaginatedItemsResponse {
  items: MyCase[];
}

export interface MyCasesApiState extends ApiHookState {
  data: MyCasesResponse;
}

export default (offset?: number, limit?: number): MyCasesApiState => {
  const { data, ...rest } = paginatedApiHook(ApiUrls.MY_CASES, offset, limit);

  return {
    ...rest,
    data: {
      ...data,
      items: formatFocusApiResponse(data.items).filter(item => item.inProgress),
    },
  };
};
