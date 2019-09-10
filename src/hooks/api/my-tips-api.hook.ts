import { ApiConfig, ApiUrls } from 'App.constants';
import { LinkProps } from 'App.types';
import usePaginatedApi, {
  PaginatedApiProps,
  PaginatedApiState,
  PaginatedItemsResponse,
} from './paginated-api.hook';

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

export interface MyTipsApiState extends PaginatedApiState {
  data: MyTipsResponse;
  refetch: (requestData: any) => void;
}

export default function useMyTipsApi(
  offset: number = 0,
  limit: number = -1
): MyTipsApiState {
  const options: PaginatedApiProps = {
    url: ApiUrls.MY_TIPS,
    offset,
    limit,
    postpone: ApiConfig[ApiUrls.MY_TIPS].postponeFetch,
    method: 'POST',
  };

  const { data, refetch, ...rest } = usePaginatedApi(options);

  return {
    ...rest,
    data,
    refetch: (requestData: any) => {
      refetch({
        requestData,
      });
    },
  };
}
