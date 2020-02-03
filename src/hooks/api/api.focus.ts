import {
  FocusApiResponse,
  FocusItem,
  formatProductCollections,
  ProductCollection,
} from 'data-formatting/focus';
import { getApiConfigValue, getApiUrl } from 'helpers/App';
import { useMemo } from 'react';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';

export interface FocusData {
  items: FocusItem[];
  recentCases: FocusItem[];
  notifications: MyNotification[];
  products: ProductCollection;
}

export type FocusApiState = ApiState<FocusData> & { rawData: FocusApiResponse };

export default function useFocusApi(): FocusApiState {
  const [api] = useDataApi<FocusApiResponse>(
    {
      url: getApiUrl('FOCUS'),
      postpone: getApiConfigValue('FOCUS', 'postponeFetch', false),
    },
    []
  );

  return useMemo(() => {
    const { allItems, allNotifications, products } = formatProductCollections(
      api.data
    );

    const recentCases = allItems.filter(item => item.isRecent);
    return {
      ...api,
      rawData: api.data,
      data: {
        items: allItems,
        notifications: allNotifications,
        recentCases,
        products,
      },
    };
  }, [api]);
}
