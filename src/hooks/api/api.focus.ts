import { ApiUrls } from 'App.constants';
import formatFocusApiResponse, { FocusItem } from 'data-formatting/focus';

import { ApiState } from './api.types';
import { MyUpdate } from './my-updates-api.hook';
import usePaginatedApi, { PaginatedItemsResponse } from './paginated-api.hook';
import { ProductTitles } from 'data-formatting/focus';
import { useMemo } from 'react';

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

function formatProductCollections(items: any[]) {
  const allItems = formatFocusApiResponse(items);
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
    allItems,
    allUpdates,
    products,
  };
}

export default function useFocusApi(
  offset?: number,
  limit?: number
): FocusApiState {
  const { data, ...rest } = usePaginatedApi(ApiUrls.FOCUS, offset, limit);
  const { allItems, allUpdates, products } = useMemo(() => {
    return formatProductCollections(data.items);
  }, [data.items.length]);
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
