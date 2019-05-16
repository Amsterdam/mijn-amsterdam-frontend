import { ApiUrls } from 'App.constants';
import formatFocusApiResponse, { FocusItem } from 'data-formatting/focus';
import { differenceInCalendarDays } from 'date-fns';

import { ApiState } from './api.types';
import { MyUpdate } from './my-updates-api.hook';
import usePaginatedApi, { PaginatedItemsResponse } from './paginated-api.hook';
import { ProductTitles } from '../../data-formatting/focus';

interface ProductCollection {
  [productTitle: string]: {
    updates: any[];
    items: FocusItem[];
  };
}

export interface FocusResponse extends PaginatedItemsResponse {
  items: FocusItem[];
  updates: MyUpdate[];
  products: ProductCollection;
}

export interface FocusApiState extends ApiState {
  data: FocusResponse;
}

export default function useFocusApi(
  offset?: number,
  limit?: number
): FocusApiState {
  const { data, ...rest } = usePaginatedApi(ApiUrls.FOCUS, offset, limit);

  const allItems = formatFocusApiResponse(data.items);
  const products: ProductCollection = {};
  const allUpdates: MyUpdate[] = [];

  for (const item of allItems) {
    const { productTitle } = item;

    if (productTitle !== ProductTitles.BijzondereBijstand) {
      let productCollecton = products[productTitle];

      if (!productCollecton) {
        productCollecton = products[productTitle] = {
          updates: [],
          items: [],
        };
      }

      if (item.update) {
        productCollecton.updates.push(item.update);
        allUpdates.push(item.update);
      }

      productCollecton.items.push(item);
    }
  }

  return {
    ...rest,
    data: {
      ...data,
      items: allItems,
      updates: allUpdates,
      products,
    },
  };
}
