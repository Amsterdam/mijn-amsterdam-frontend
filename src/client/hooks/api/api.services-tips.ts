import { useCallback, useMemo } from 'react';

import { ApiState } from './api.types';
import { BFFApiUrls } from '../../../universal/config';
import { TIPSData } from '../../../server/services';
import { getApiConfigValue } from '../../../universal/helpers';
import { useCookie } from '../storage.hook';
import { useDataApi } from './api.hook';

export interface ServicesTipsData extends TIPSData {
  isOptIn: boolean;
  optIn: () => void;
  optOut: () => void;
}

export type ServicesTipsApiState = ApiState<ServicesTipsData>;

const API_ID = 'SERVICES_TIPS';

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

export function useServicesTips(): ServicesTipsApiState {
  const [api] = useDataApi<TIPSData>(
    {
      url: BFFApiUrls[API_ID],
      postpone: getApiConfigValue(API_ID, 'postponeFetch', false),
    },
    { items: [] }
  );

  const { isOptIn, optIn, optOut } = useOptIn();

  return useMemo(() => {
    const data = {
      ...api.data,
      isOptIn,
      optIn,
      optOut,
    };

    return {
      ...api,
      data,
    };
  }, [api, optIn, optOut, isOptIn]);
}
