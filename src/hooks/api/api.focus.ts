import {
  FocusApiResponse,
  FocusInkomenSpecificatie,
  FocusInkomenSpecificatieFromSource,
  FocusItem,
  formatFocusItems,
  formatIncomeSpecifications,
} from 'data-formatting/focus';
import { getApiConfigValue, getApiUrl } from 'helpers/App';

import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';
import { useDataApi } from './api.hook';
import { useMemo } from 'react';

export interface IncomeSpecificationsResponse {
  content: {
    jaaropgaven: FocusInkomenSpecificatieFromSource[];
    uitkeringsspecificaties: FocusInkomenSpecificatieFromSource[];
  };
}

export interface IncomeSpecifications {
  jaaropgaven: FocusInkomenSpecificatie[];
  uitkeringsspecificaties: FocusInkomenSpecificatie[];
}

export type FocusInkomenSpecificatiesApiState = ApiState<IncomeSpecifications>;

export function useFocusInkomenSpecificatiesApi(): FocusInkomenSpecificatiesApiState {
  const [api] = useDataApi<IncomeSpecificationsResponse>(
    {
      url: getApiUrl('FOCUS_INKOMEN_SPECIFICATIES'),
      postpone: getApiConfigValue(
        'FOCUS_INKOMEN_SPECIFICATIES',
        'postponeFetch',
        false
      ),
    },
    {
      content: {
        jaaropgaven: [],
        uitkeringsspecificaties: [],
      },
    }
  );

  return useMemo(
    () => ({ ...api, data: formatIncomeSpecifications(api.data) }),
    [api]
  );
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
    const { items, notifications } = formatFocusItems(api.data);
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
