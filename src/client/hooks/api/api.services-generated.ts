import { useDataApi } from './api.hook';
import { BFFApiUrls } from '../../../universal/config';

import {
  apiPristineResponseData,
  FEApiResponseData,
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../../../universal/helpers';
import { loadServicesGenerated } from '../../../server/services';
import { useMemo, useEffect } from 'react';
import { TIPSData } from '../../../server/services/tips';
import { WelcomeNotification } from '../../config/staticData';
import { apiSuccesResult } from '../../../universal/helpers/api';
import { useOptIn } from '../optin.hook';

const pristineResponseData = apiPristineResponseData({
  TIPS: { items: [] },
  NOTIFICATIONS: { items: [], total: 0 },
  CASES: [],
});

export type ServicesGeneratedData = FEApiResponseData<
  typeof loadServicesGenerated
> & {
  TIPS: ApiErrorResponse<TIPSData> | ApiSuccessResponse<TIPSData>;
};

type ServicesGeneratedApiData =
  | ServicesGeneratedData
  | typeof pristineResponseData;

const API_ID = 'SERVICES_GENERATED';

export function useServicesGenerated(postpone: boolean = false) {
  const { isOptIn } = useOptIn();

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
      });
    }

    return tipsSource;
  }, [tipsSource, isOptIn]);

  return {
    ...api,
    data: {
      NOTIFICATIONS,
      CASES,
      TIPS,
    },
  };
}
