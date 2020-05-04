import {
  FocusApiResponse,
  FocusInkomenSpecificatie,
  FocusCombinedItemFromSource,
  FocusItem,
  formatFocusItems,
  formatFocusCombinedSpecifications,
} from 'data-formatting/focus';
import { getApiConfigValue, getApiUrl } from 'helpers/App';

import { ApiState } from './api.types';
import { MyNotification } from './my-notifications-api.hook';
import { useDataApi } from './api.hook';
import { useMemo } from 'react';
import {
  formatFocusCombinedTozo,
  TOZO_LENING_PRODUCT_TITLE,
  TOZO_UITKERING_PRODUCT_TITLE,
  TOZO_VOORSCHOT_PRODUCT_TITLE,
  FocusTozoDocument,
  FocusTozo,
} from '../../data-formatting/focus-tozo';

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

export type FocusCombinedApiState = ApiState<FocusCombinedResponse>;
export type FocusCombinedSpecificationsApiState = ApiState<
  Omit<FocusCombined, 'tozodocumenten'>
>;
export type FocusTozoApiState = ApiState<FocusTozo>;

export interface FocusData {
  items: FocusItem[];
  recentCases: FocusItem[];
  notifications: MyNotification[];
}

export function useFocusCombinedApi(): FocusCombinedApiState {
  const [api] = useDataApi<FocusCombinedResponse>(
    {
      url: getApiUrl('FOCUS_SPECIFICATIONS'),
      postpone: getApiConfigValue(
        'FOCUS_SPECIFICATIONS',
        'postponeFetch',
        false
      ),
    },
    {
      content: {
        jaaropgaven: [],
        uitkeringsspecificaties: [],
        tozodocumenten: [],
      },
    }
  );

  return api;
}

export function useFocusCombinedSpecificationsApi(): FocusCombinedSpecificationsApiState {
  const api = useFocusCombinedApi();

  return useMemo(
    () => ({
      ...api,
      data: formatFocusCombinedSpecifications(api.data),
    }),
    [api]
  );
}

export function useFocusCombinedTozoApi(): FocusTozoApiState {
  const apiCombined = useFocusCombinedApi();
  const apiFocus = useFocusApi();

  return useMemo(
    () => ({
      isLoading: apiCombined.isLoading || apiFocus.isLoading,
      isDirty: apiCombined.isDirty || apiFocus.isDirty,
      isError: apiCombined.isError || apiFocus.isError,
      isPristine: apiCombined.isPristine && apiFocus.isPristine,
      errorMessage: '',
      data: formatFocusCombinedTozo({
        documenten: apiCombined.data.content.tozodocumenten,
        aanvragen: apiFocus.rawData.filter(item =>
          [
            TOZO_LENING_PRODUCT_TITLE,
            TOZO_UITKERING_PRODUCT_TITLE,
            TOZO_VOORSCHOT_PRODUCT_TITLE,
          ].includes(item.naam)
        ),
      }),
    }),
    [apiCombined, apiFocus]
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
