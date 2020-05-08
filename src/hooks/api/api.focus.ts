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
  formatFocusTozo,
  FocusTozoDocument,
  FocusTozo,
} from '../../data-formatting/focus-tozo';
import { FeatureToggle } from 'config/App.constants';

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
export type FocusTozoApiState = ApiState<FocusTozo | null>;

export interface FocusData {
  items: FocusItem[];
  recentCases: FocusItem[];
  notifications: MyNotification[];
}

function useFocusCombinedApi(): FocusCombinedApiState {
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

function useFocusCombinedSpecificationsApi(
  apiCombined: ReturnType<typeof useFocusCombinedApi>
): FocusCombinedSpecificationsApiState {
  return useMemo(
    () => ({
      ...apiCombined,
      data: formatFocusCombinedSpecifications(apiCombined.data),
    }),
    [apiCombined]
  );
}

function useFocusCombinedTozoApi(
  apiCombined: ReturnType<typeof useFocusCombinedApi>,
  apiAanvragen: ReturnType<typeof useFocusAanvragenApi>
): FocusTozoApiState {
  return useMemo(
    () => ({
      isLoading: apiCombined.isLoading || apiAanvragen.isLoading,
      isDirty: apiCombined.isDirty || apiAanvragen.isDirty,
      isError: apiCombined.isError || apiAanvragen.isError,
      isPristine: apiCombined.isPristine && apiAanvragen.isPristine,
      errorMessage: '',
      data: FeatureToggle.tozoActive
        ? formatFocusTozo({
            documenten: apiCombined.data.content.tozodocumenten || [],
            aanvragen: apiAanvragen.rawData,
          })
        : null,
    }),
    [apiCombined, apiAanvragen]
  );
}

export interface FocusData {
  items: FocusItem[];
  recentCases: FocusItem[];
  notifications: MyNotification[];
}

export type FocusApiState = ApiState<FocusData> & { rawData: FocusApiResponse };

function useFocusAanvragenApi(): FocusApiState {
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

export default function useFocusApi() {
  const FOCUS_COMBINED = useFocusCombinedApi();
  const AANVRAGEN = useFocusAanvragenApi();

  const SPECIFICATIES = useFocusCombinedSpecificationsApi(FOCUS_COMBINED);
  const TOZO = useFocusCombinedTozoApi(FOCUS_COMBINED, AANVRAGEN);

  return {
    AANVRAGEN,
    SPECIFICATIES,
    TOZO,
  };
}
