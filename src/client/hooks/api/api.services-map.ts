import {
  apiPristineResponseData,
  FEApiResponseData,
} from '../../../universal/helpers';
import { useDataApi } from './api.hook';
import { loadServicesMap } from '../../../server/services/services-map';
import { BFFApiUrls } from '../../config/api';

const pristineResponseData = apiPristineResponseData({
  BUURT: null,
});

const API_ID = 'SERVICES_MAP';

export type ServicesMapData = FEApiResponseData<typeof loadServicesMap>;

export function useServicesMap(postpone: boolean = false) {
  const [api] = useDataApi<ServicesMapData | typeof pristineResponseData>(
    {
      url: BFFApiUrls[API_ID],
      postpone,
    },
    pristineResponseData
  );

  return api;
}
