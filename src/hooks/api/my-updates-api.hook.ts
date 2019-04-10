import { ApiUrls, Chapter } from 'App.constants';
import paginatedApiHook, { PaginatedItems } from './paginated-api.hook';
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

export interface MyUpdates extends PaginatedItems {
  items: MyUpdate[];
}

export interface MyUpdatesState extends ApiHookState {
  data: MyUpdates;
}

export default (offset?: number, limit?: number) => {
  return paginatedApiHook(ApiUrls.MY_UPDATES, offset, limit);
};
