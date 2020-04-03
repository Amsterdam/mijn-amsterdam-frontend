import { ApiState, useDataApi } from './api.hook';
import { BFFApiData, BFFApiUrls } from '../../../universal/config';

import { getApiConfigValue } from '../../../universal/helpers';

export interface ServicesDirectData {
  FOCUS: BFFApiData['FOCUS'] | null;
  WMO: BFFApiData['WMO'] | null;
  ERFPACHT: BFFApiData['ERFPACHT'] | null;
  BELASTINGEN: BFFApiData['BELASTINGEN'] | null;
  MILIEUZONE: BFFApiData['MILIEUZONE'] | null;
}

export type ServicesDirectApiState = ApiState<ServicesDirectData>;

const API_ID = 'SERVICES_DIRECT';

export function useServicesDirect(): ServicesDirectApiState {
  const [api] = useDataApi<ServicesDirectData>(
    {
      url: BFFApiUrls[API_ID],
      postpone: getApiConfigValue(API_ID, 'postponeFetch', false),
    },
    {
      FOCUS: null,
      WMO: null,
      ERFPACHT: null,
      BELASTINGEN: null,
      MILIEUZONE: null,
    }
  );

  return api;
}
