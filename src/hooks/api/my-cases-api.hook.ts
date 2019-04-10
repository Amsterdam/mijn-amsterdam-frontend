import { ApiUrls } from 'App.constants';
import paginatedApiHook, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiHookState } from './api.types';

export interface MyCase {
  datePublished: string;
  title: string;
  subtitle: string;
  description: string;
  link: {
    label: string;
    to: string;
  };
}

export interface MyCasesResponse extends PaginatedItemsResponse {
  items: MyCase[];
}

export interface MyCasesState extends ApiHookState {
  data: MyCasesResponse;
}

export default (offset?: number, limit?: number): MyCasesState => {
  return paginatedApiHook(ApiUrls.MY_CASES, offset, limit);
};
