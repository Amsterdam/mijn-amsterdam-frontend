import { LinkProps } from 'App.types';
import { getApiConfigValue, getApiUrl } from 'helpers/App';
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
    url: getApiUrl('MY_TIPS'),
    offset,
    limit,
    postpone: getApiConfigValue('MY_TIPS', 'postponeFetch', false),
    method: 'POST',
  };

  const { data, refetch, ...rest } = usePaginatedApi(options);

  return {
    ...rest,
    data,
    refetch: ({
      BRP: brp,
      FOCUS: focus,
      ERFPACHT: erfpacht,
      WMO: wmo,
    }: any) => {
      const requestDataFormatted = {
        optin: false,
        data: {
          brp,
          focus,
          erfpacht,
          wmo,
        },
      };
      refetch({
        requestData: requestDataFormatted,
      });
    },
  };
}
