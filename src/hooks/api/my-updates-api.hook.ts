import { ApiUrls, Chapter } from 'App.constants';
import paginatedApiHook, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiHookState } from './api.types';

export interface MyUpdate {
  chapter: Chapter;
  datePublished: string;
  title: string;
  description: string;
  link: {
    label: string;
    to: string;
  };
}

export interface MyUpdatesResponse extends PaginatedItemsResponse {
  items: MyUpdate[];
}

export interface MyUpdatesState extends ApiHookState {
  data: MyUpdatesResponse;
}

export default (offset?: number, limit?: number): MyUpdatesState => {
  return paginatedApiHook(ApiUrls.MY_UPDATES, offset, limit);
};
