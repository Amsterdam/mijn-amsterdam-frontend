import { ApiUrls } from 'App.constants';
import paginatedApiHook, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiHookState } from './api.types';

export interface MyTip {
  datePublished: string;
  title: string;
  subtitle: string;
  description: string;
  link: {
    title: string;
    to: string;
  };
}

export interface MyTipsResponse extends PaginatedItemsResponse {
  items: MyTip[];
}

export interface MyTipsApiState extends ApiHookState {
  data: MyTipsResponse;
}

export default (offset?: number, limit?: number): MyTipsApiState => {
  return paginatedApiHook(ApiUrls.MY_TIPS, offset, limit);
};
