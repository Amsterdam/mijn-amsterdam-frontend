import { useDataApi } from './api.hook';
import { BFFApiUrls } from '../../../universal/config';

import {
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
import { apiSuccesResult } from '../../../universal/helpers/api';

const pristineResponseData = apiPristineResponseData({
  TIPS: { items: [] },
  NOTIFICATIONS: { items: [], total: 0 },
  CASES: [],
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

export function useServicesGenerated(postpone: boolean = false) {
  const { isOptIn, optIn, optOut } = useOptIn();

  const [api, refetch] = useDataApi<ServicesGeneratedApiData>(
    {
      postpone: true,
    },
    pristineResponseData
  );

  useEffect(() => {
    if (!postpone) {
      refetch({
        url: BFFApiUrls[API_ID],
        params: { optin: isOptIn ? 1 : 0 },
        postpone: false,
      });
    }
  }, [postpone, refetch, isOptIn]);

  const {
    NOTIFICATIONS: notificationsSource,
    TIPS: tipsSource,
    CASES,
  } = api.data;

  const NOTIFICATIONS = useMemo(() => {
    if (notificationsSource.status === 'success') {
      return apiSuccesResult({
        items: [...notificationsSource.content.items, WelcomeNotification],
      });
    }
    return notificationsSource;
  }, [notificationsSource]);

  const TIPS = useMemo(() => {
    if (tipsSource.status === 'success') {
      return apiSuccesResult({
        ...tipsSource.content,
        isOptIn,
        optIn,
        optOut,
      });
    }

    return tipsSource;
  }, [tipsSource, isOptIn, optIn, optOut]);

  return {
    ...api,
    data: {
      NOTIFICATIONS,
      CASES,
      TIPS,
    },
  };
}
