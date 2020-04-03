import { BFFApiData, BFFApiUrls } from '../../../universal/config';

import { ApiState } from './api.types';
import { getApiConfigValue } from '../../../universal/helpers';
import { useDataApi } from './api.hook';

export interface ServicesRelatedData {
  BRP: BFFApiData['BRP'] | null;
  BAG: BFFApiData['BAG'] | null;
  AFVAL: BFFApiData['AFVAL'] | null;
}

export type ServicesRelatedApiState = ApiState<ServicesRelatedData>;

const API_ID = 'SERVICES_RELATED';

export function useServicesRelated(): ServicesRelatedApiState {
  const [api] = useDataApi<ServicesRelatedData>(
    {
      url: BFFApiUrls[API_ID],
      postpone: getApiConfigValue(API_ID, 'postponeFetch', false),
    },
    {
      BRP: null,
      AFVAL: null,
      BAG: null,
    }
  );

  return api;
}
