import { formatWmoApiResponse, WmoItem } from 'data-formatting/wmo';
import { getApiConfigValue } from 'helpers/App';
import { getApiUrl } from '../../helpers/App';
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
    url: getApiUrl('WMO'),
    offset,
    limit,
    postpone: getApiConfigValue('WMO', 'postponeFetch', false),
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
