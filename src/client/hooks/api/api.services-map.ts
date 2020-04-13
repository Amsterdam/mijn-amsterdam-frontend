import {
  apiPristineResponseData,
  FEApiResponseData,
} from '../../../universal/helpers';
import { useDataApi } from './api.hook';
import { BFFApiUrls } from '../../../universal/config';
import { loadServicesMap } from '../../../server/services/services-map';

const pristineResponseData = apiPristineResponseData({
  BUURT: null,
});

const API_ID = 'SERVICES_MAP';

export type ServicesMapData = FEApiResponseData<typeof loadServicesMap>;

export function useServicesMap() {
  const [api] = useDataApi<ServicesMapData | typeof pristineResponseData>(
    {
      url: BFFApiUrls[API_ID],
    },
    pristineResponseData
  );

  return api;
}
