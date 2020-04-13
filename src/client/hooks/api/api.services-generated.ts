import { useDataApi } from './api.hook';
import { BFFApiUrls } from '../../../universal/config';

import {
  getApiConfigValue,
  apiPristineResponseData,
  FEApiResponseData,
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../../universal/helpers';
import { loadServicesGenerated } from '../../../server/services';
import { useCookie } from '../storage.hook';
import { useCallback, useMemo, useEffect } from 'react';
import { TIPSData } from '../../../server/services/tips';
import { WelcomeNotification } from '../../config/staticData';

const pristineResponseData = apiPristineResponseData({
  TIPS: null,
  NOTIFICATIONS: { items: [], total: 0 },
  CASES: null,
});

export interface Optin {
  isOptIn: boolean;
  optIn: () => void;
  optOut: () => void;
}

export type ServicesGeneratedData = FEApiResponseData<
  typeof loadServicesGenerated
> & {
  TIPS: ApiErrorResponse | ApiSuccessResponse<TIPSData & Optin>;
};

type ServicesGeneratedApiData =
  | ServicesGeneratedData
  | typeof pristineResponseData;

const API_ID = 'SERVICES_GENERATED';

export function useOptIn(): Optin {
  const [isOptIn, setOptIn] = useCookie('optInPersonalizedTips', 'no');

  const optIn = useCallback(() => {
    setOptIn('yes', { path: '/' });
  }, [setOptIn]);

  const optOut = useCallback(() => {
    setOptIn('no', { path: '/' });
  }, [setOptIn]);

  return { isOptIn: isOptIn === 'yes', optIn, optOut };
}

export function useServicesGenerated() {
  const { isOptIn, optIn, optOut } = useOptIn();

  const [api, refetch] = useDataApi<ServicesGeneratedApiData>(
    {
      postpone: true,
    },
    pristineResponseData
  );

  useEffect(() => {
    refetch({
      url: BFFApiUrls[API_ID],
      params: { optin: isOptIn ? 1 : 0 },
      postpone: false,
    });
  }, [refetch, isOptIn]);

  return useMemo(() => {
    const tipsContent = api.data.TIPS.content;

    if (tipsContent) {
      Object.assign(tipsContent, { isOptIn, optIn, optOut });
    }

    const notificationsContent = api.data.NOTIFICATIONS.content;
    const items = (notificationsContent?.items || []).concat(
      WelcomeNotification
    );

    Object.assign(notificationsContent, {
      items,
      total: items.length,
    });

    return api;
  }, [api, isOptIn, optIn, optOut]);
}
