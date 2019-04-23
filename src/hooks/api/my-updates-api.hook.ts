import { ApiUrls, Chapter } from 'App.constants';
import paginatedApiHook, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiHookState } from './api.types';
import { LinkProps } from 'App.types';

export interface MyUpdate {
  id: string;
  chapter: Chapter;
  datePublished: string;
  title: string;
  description: string;
  link: LinkProps;
}

export interface MyUpdatesResponse extends PaginatedItemsResponse {
  items: MyUpdate[];
}

export interface MyUpdatesApiState extends ApiHookState {
  data: MyUpdatesResponse;
}

export default (offset?: number, limit?: number): MyUpdatesApiState => {
  return paginatedApiHook(ApiUrls.MY_UPDATES, offset, limit);
};
