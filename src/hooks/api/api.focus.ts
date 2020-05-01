import {
  FocusApiResponse,
  FocusInkomenSpecificatie,
  FocusCombinedItemFromSource,
  FocusItem,
  FocusTozoDocument,
  formatFocusItems,
  formatFocusCombined,
} from 'data-formatting/focus';
import { getApiConfigValue, getApiUrl } from 'helpers/App';

import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';
import { useDataApi } from './api.hook';
import { useMemo } from 'react';

export interface FocusCombinedResponse {
  content: {
    jaaropgaven: FocusCombinedItemFromSource[];
    uitkeringsspecificaties: FocusCombinedItemFromSource[];
    tozodocumenten: FocusCombinedItemFromSource[];
  };
}

export interface FocusCombined {
  jaaropgaven: FocusInkomenSpecificatie[];
  uitkeringsspecificaties: FocusInkomenSpecificatie[];
  notifications: MyNotification[];
  tozodocumenten: FocusTozoDocument[];
}

export type FocusCombinedApiState = ApiState<FocusCombined>;

export interface FocusData {
  items: FocusItem[];
  recentCases: FocusItem[];
  notifications: MyNotification[];
}

export function useFocusCombinedApi(): FocusCombinedApiState {
  const [api] = useDataApi<FocusCombinedResponse>(
    {
      url: getApiUrl('FOCUS_COMBINED'),
      postpone: getApiConfigValue('FOCUS_COMBINED', 'postponeFetch', false),
    },
    {
      content: {
        jaaropgaven: [],
        uitkeringsspecificaties: [],
        tozodocumenten: [],
      },
    }
  );

  return useMemo(() => ({ ...api, data: formatFocusCombined(api.data) }), [
    api,
  ]);
}

export interface FocusData {
  items: FocusItem[];
  recentCases: FocusItem[];
  notifications: MyNotification[];
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
    const { items, notifications } = formatFocusItems(api.data, new Date());
    const recentCases = items.filter(item => item.isRecent);

    return {
      ...api,
      rawData: api.data,
      data: {
        items,
        notifications,
        recentCases,
      },
    };
  }, [api]);
}
