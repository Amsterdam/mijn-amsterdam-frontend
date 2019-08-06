import { ApiUrls } from 'App.constants';
import { LinkProps } from 'App.types';
import { ApiConfig } from '../../App.constants';
import { ApiState } from './api.types';
import usePaginatedApi, { PaginatedItemsResponse } from './paginated-api.hook';

export interface MyTip {
  datePublished: string;
  title: string;
  subtitle: string;
  description: string;
  link: LinkProps;
  imgUrl?: string;
}

export interface MyTipsResponse extends PaginatedItemsResponse {
  items: MyTip[];
}

export interface MyTipsApiState extends ApiState {
  data: MyTipsResponse;
}

export default function useMyTipsApi(
  offset?: number,
  limit?: number
): MyTipsApiState {
  // NOTE: The tips api is not available in production yet
  return usePaginatedApi(
    ApiUrls.MY_TIPS,
    offset,
    limit,
    ApiConfig[ApiUrls.MY_TIPS].postponeFetch,
    'POST'
  );
}
