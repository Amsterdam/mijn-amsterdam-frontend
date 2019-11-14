import { LinkProps } from 'App.types';
import { getApiConfigValue, getApiUrl } from 'helpers/App';
import { useCookie } from 'hooks/storage.hook';
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
  isPersonalized?: boolean;
}

export interface MyTipsResponse extends PaginatedItemsResponse {
  items: MyTip[];
}

export interface MyTipsApiState extends PaginatedApiState {
  data: MyTipsResponse;
  refetch: (requestData: any) => void;
  isOptIn: boolean;
  optIn: () => void;
  optOut: () => void;
}

export function useOptIn(): [boolean, () => void, () => void] {
  const [isOptIn, setOptIn] = useCookie('optInPersonalizedTips', 'no');

  function optIn() {
    setOptIn('yes', { path: '/' });
  }

  function optOut() {
    setOptIn('no', { path: '/' });
  }

  return [isOptIn === 'yes', optIn, optOut];
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

  const { data, refetch: originalRefetch, isDirty, ...rest } = usePaginatedApi(
    options
  );

  const [isOptIn, optIn, optOut] = useOptIn();

  function refetch({
    BRP: brp,
    FOCUS: focus,
    ERFPACHT: erfpacht,
    WMO: wmo,
  }: any) {
    const requestDataFormatted = {
      optin: isOptIn,
      data: {
        brp,
        focus,
        erfpacht,
        wmo,
      },
    };
    originalRefetch({
      requestData: requestDataFormatted,
    });
  }

  return {
    ...rest,
    isDirty,
    data,
    refetch,
    isOptIn,
    optIn,
    optOut,
  };
}
