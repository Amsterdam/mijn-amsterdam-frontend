import { ApiUrls } from 'App.constants';
import usePaginatedApi, { PaginatedItemsResponse } from './paginated-api.hook';
import { ApiState } from './api.types';
import { LinkProps } from 'App.types';

export interface MyTip {
  datePublished: string;
  title: string;
  subtitle: string;
  description: string;
  link: LinkProps;
}

export interface MyTipsResponse extends PaginatedItemsResponse {
  items: MyTip[];
}

export interface MyTipsApiState extends ApiState {
  data: MyTipsResponse;
}

export default (offset?: number, limit?: number): MyTipsApiState => {
  return usePaginatedApi(ApiUrls.MY_TIPS, offset, limit);
};
