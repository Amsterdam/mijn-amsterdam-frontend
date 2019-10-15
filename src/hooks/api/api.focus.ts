import {
  FocusItem,
  formatProductCollections,
  ProductCollection,
} from 'data-formatting/focus';
import { getApiConfigValue, getApiUrl } from 'helpers/App';
import { useMemo } from 'react';
import { MyNotification } from './my-notifications-api.hook';
import usePaginatedApi, {
  PaginatedApiState,
  PaginatedItemsResponse,
} from './paginated-api.hook';

export interface FocusData extends PaginatedItemsResponse {
  items: FocusItem[];
  recentCases: FocusItem[];
  notifications: MyNotification[];
  products: ProductCollection;
}

export interface FocusApiState extends PaginatedApiState {
  data: FocusData;
}

export default function useFocusApi(
  offset: number = 0,
  limit: number = -1
): FocusApiState {
  const { data, ...rest } = usePaginatedApi({
    url: getApiUrl('FOCUS'),
    offset,
    limit,
    postpone: getApiConfigValue('FOCUS', 'postponeFetch', false),
  });

  const { allItems, allNotifications, products } = useMemo(() => {
    return formatProductCollections(data.items);
  }, [data.items.length]);

  const recentCases = allItems.filter(item => item.isRecent);

  return {
    ...rest,
    data: {
      ...data,
      items: allItems,
      notifications: allNotifications,
      recentCases,
      products,
    },
  };
}
