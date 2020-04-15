import { BFFApiUrls } from '../../../universal/config';
import {
  FEApiResponseData,
  apiPristineResponseData,
} from '../../../universal/helpers';
import { ApiState, useDataApi } from './api.hook';
import { loadServicesDirect } from '../../../server/services';

const pristineResponseData = apiPristineResponseData({
  FOCUS_SPECIFICATIES: null,
  FOCUS_AANVRAGEN: null,
  WMO: null,
  ERFPACHT: null,
  BELASTINGEN: null,
  MILIEUZONE: null,
});

export type ServicesDirectData = FEApiResponseData<typeof loadServicesDirect>;
export type ServicesDirectApiState = ApiState<ServicesDirectData>;

const API_ID = 'SERVICES_DIRECT';

export function useServicesDirect(postpone: boolean = false) {
  const [api] = useDataApi<ServicesDirectData | typeof pristineResponseData>(
    {
      url: BFFApiUrls[API_ID],
      postpone,
    },
    pristineResponseData
  );

  return api;
}
