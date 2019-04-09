import { ApiUrls, Chapter } from 'App.constants';
import paginatedApiHook, { PaginatedItemsState } from './paginated-api.hook';
import { ApiHook } from './api.types';

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

export interface MyUpdatesData extends PaginatedItemsState {
  items: MyUpdate[];
}

export interface MyUpdatesState extends ApiHook {
  data: MyUpdatesData;
}

export default (offset?: number, limit?: number) => {
  return paginatedApiHook(ApiUrls.MY_UPDATES, offset, limit);
};
