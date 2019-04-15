import { ApiUrls, Chapter, Chapters } from 'App.constants';
import paginatedApiHook, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiHookState } from './api.types';
import formatFocusApiResponse from 'data-formatting/focus';
import { LinkProps } from 'App.types';

export interface MyUpdate {
  chapter: Chapter;
  datePublished: string;
  title: string;
  description: string;
  link: LinkProps;
}

export interface MyUpdatesResponse extends PaginatedItemsResponse {
  items: MyUpdate[];
}

export interface MyUpdatesState extends ApiHookState {
  data: MyUpdatesResponse;
}

export default (offset?: number, limit?: number): MyUpdatesState => {
  const { data, ...rest } = paginatedApiHook(ApiUrls.MY_UPDATES, offset, limit);
  const items = formatFocusApiResponse(data.items) as any[];
  // TODO: Store last visited date in localhost and check against that
  const myUpdateItems = items.map(item => ({
    ...item,
    chapter: Chapters.INKOMEN,
  }));

  return {
    ...rest,
    data: {
      ...data,
      items: myUpdateItems,
      total: myUpdateItems.length,
    },
  };
};
