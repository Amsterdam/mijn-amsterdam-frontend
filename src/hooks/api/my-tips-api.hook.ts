import { LinkProps } from 'App.types';
import { AppState } from 'AppState';
import { getApiConfigValue, getApiUrl } from 'helpers/App';
import { useCookie } from 'hooks/storage.hook';
import { useCallback, useMemo } from 'react';
import { useDataApi } from './api.hook';
import { ApiRequestOptions, ApiState } from './api.types';

export interface MyTip {
  datePublished: string;
  title: string;
  subtitle: string;
  description: string;
  link: LinkProps;
  imgUrl?: string;
  isPersonalized: boolean;
  priority?: number;
}

export interface MyTipsResponse {
  items: MyTip[];
}

export type MyTipsApiState = ApiState<MyTipsResponse> & {
  refetch: (data: any) => void;
  isOptIn: boolean;
  optIn: () => void;
  optOut: () => void;
};

export function useOptIn(): {
  isOptIn: boolean;
  optIn: () => void;
  optOut: () => void;
} {
  const [isOptIn, setOptIn] = useCookie('optInPersonalizedTips', 'no');

  const optIn = useCallback(() => {
    setOptIn('yes', { path: '/' });
  }, [setOptIn]);

  const optOut = useCallback(() => {
    setOptIn('no', { path: '/' });
  }, [setOptIn]);

  return { isOptIn: isOptIn === 'yes', optIn, optOut };
}

export default function useMyTipsApi(): MyTipsApiState {
  const options: ApiRequestOptions = {
    url: getApiUrl('MIJN_TIPS'),
    postpone: getApiConfigValue('MIJN_TIPS', 'postponeFetch', false),
    method: 'POST',
  };

  const [api, originalRefetch] = useDataApi<MyTipsResponse>(options, {
    items: [],
  });
  // const { data, isDirty, ...rest } = api;
  const { isOptIn, optIn, optOut } = useOptIn();

  const refetch = useCallback(
    (requestData: AppState) => {
      const {
        BRP: brp,
        FOCUS: focus,
        ERFPACHT: erfpacht,
        WMO: wmo,
        BELASTINGEN: belasting,
      } = requestData;
      const requestDataFormatted = {
        optin: isOptIn,
        data: {
          brp,
          focus,
          erfpacht,
          wmo,
          belasting,
        },
      };
      originalRefetch({
        data: requestDataFormatted,
      });
    },
    [originalRefetch, isOptIn]
  );

  return useMemo(() => {
    return {
      ...api,
      refetch,
      isOptIn,
      optIn,
      optOut,
    };
  }, [api, refetch, optIn, optOut, isOptIn]);
}
