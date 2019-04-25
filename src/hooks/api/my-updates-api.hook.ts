import { ApiUrls, Chapter } from 'App.constants';
import usePaginatedApi, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiState } from './api.types';
import { LinkProps } from 'App.types';
import { isProduction } from 'helpers/App';

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

export interface MyUpdatesApiState extends ApiState {
  data: MyUpdatesResponse;
}

export default (offset?: number, limit?: number): MyUpdatesApiState => {
  // NOTE: The updates api is not available in production yet
  return usePaginatedApi(ApiUrls.MY_UPDATES, offset, limit, isProduction());
};
