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

export type FocusInkomenSpecificatieType =
  | 'IOAZ'
  | 'BBS'
  | 'WKO'
  | 'IOAW'
  | 'STIMREG'
  | 'BIBI'
  | 'PART'
  | 'BBZ';

export const focusInkomenSpecificatieTypes: {
  [type in FocusInkomenSpecificatieType]: string;
} = {
  IOAZ: 'IOAZ',
  BBS: 'Bijzonder bijstand en stimuleringsregelingen',
  WKO: 'Wet kinderopvang',
  IOAW: 'IOAW',
  STIMREG: 'Stimuleringsregelingen',
  BIBI: 'Bijzonder bijstand',
  PART: 'Participatiewet',
  BBZ: 'BBZ',
};

export interface FocusInkomenSpecificatie {
  title: string;
  datePublished: string;
  id: string;
  url: string;
  type: FocusInkomenSpecificatieType;
}

export type FocusInkomenSpecificatiesApiState = ApiState<
  FocusInkomenSpecificatie[]
>;

export function useFocusInkomenSpecificatiesApi(): FocusInkomenSpecificatiesApiState {
  const [api] = useDataApi<FocusInkomenSpecificatie[]>(
    {
      url: getApiUrl('FOCUS_INKOMEN_SPECIFICATIES'),
      postpone: getApiConfigValue(
        'FOCUS_INKOMEN_SPECIFICATIES',
        'postponeFetch',
        false
      ),
    },
    []
  );

  return api;
}

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
