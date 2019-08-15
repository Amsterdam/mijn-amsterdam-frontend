import { ApiConfig, ApiUrls } from 'App.constants';
import {
  FocusItem,
  formatProductCollections,
  ProductCollection,
} from 'data-formatting/focus';
import { useMemo } from 'react';
import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';
import usePaginatedApi, { PaginatedItemsResponse } from './paginated-api.hook';

export interface FocusData extends PaginatedItemsResponse {
  items: FocusItem[];
  recentCases: FocusItem[];
  notifications: MyNotification[];
  products: ProductCollection;
}

export interface FocusApiState extends ApiState {
  data: FocusData;
}

export default function useFocusApi(
  offset?: number,
  limit?: number
): FocusApiState {
  const { data, ...rest } = usePaginatedApi(
    ApiUrls.FOCUS,
    offset,
    limit,
    ApiConfig[ApiUrls.FOCUS].postponeFetch
  );

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
