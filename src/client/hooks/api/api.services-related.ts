import { useDataApi } from './api.hook';
import { BFFApiUrls } from '../../../universal/config';

import {
  apiPristineResponseData,
  FEApiResponseData,
} from '../../../universal/helpers';
import { loadServicesRelated } from '../../../server/services';

const pristineResponseData = apiPristineResponseData({
  BRP: null,
  AFVAL: null,
  HOME: null,
});

export type ServicesRelatedData = FEApiResponseData<typeof loadServicesRelated>;

const API_ID = 'SERVICES_RELATED';

export function useServicesRelated() {
  const [api] = useDataApi<ServicesRelatedData | typeof pristineResponseData>(
    {
      url: BFFApiUrls[API_ID],
    },
    pristineResponseData
  );

  return api;
}
