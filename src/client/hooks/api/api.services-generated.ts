import { useEffect, useMemo } from 'react';
import { loadServicesGenerated, TIPSData } from '../../../server/services';
import {
  ApiErrorResponse,
  apiPristineResponseData,
  ApiSuccessResponse,
  FEApiResponseData,
} from '../../../universal/helpers';
import { apiSuccesResult } from '../../../universal/helpers/api';
import { BFFApiUrls } from '../../config/api';
import { WelcomeNotification } from '../../config/staticData';
import { useOptIn } from '../optin.hook';
import { useDataApi } from './api.hook';

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
    if (notificationsSource.status === 'OK') {
      return apiSuccesResult({
        items: [...notificationsSource.content.items, WelcomeNotification],
      });
    }
    return notificationsSource;
  }, [notificationsSource]);

  const TIPS = useMemo(() => {
    if (tipsSource.status === 'OK') {
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
