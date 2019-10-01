import { ApiConfig, ApiUrls } from 'App.constants';
import { formatWmoApiResponse, WmoItem } from 'data-formatting/wmo';
import usePaginatedApi, {
  PaginatedApiState,
  PaginatedItemsResponse,
} from './paginated-api.hook';

export interface WmoApiState extends PaginatedApiState {
  data: PaginatedItemsResponse & {
    items: WmoItem[];
  };
}

export default (offset: number = 0, limit: number = -1): WmoApiState => {
  const { data, ...rest } = usePaginatedApi({
    url: ApiUrls.WMO,
    offset,
    limit,
    postpone: ApiConfig[ApiUrls.WMO].postponeFetch,
  });

  const items = Array.isArray(data.items)
    ? formatWmoApiResponse(data.items)
    : [];

  return {
    ...rest,
    data: {
      ...data,
      items,
    },
  };
};
