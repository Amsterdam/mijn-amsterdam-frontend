import { loadServicesRelated } from '../../../server/services';
import {
  apiPristineResponseData,
  FEApiResponseData,
} from '../../../universal/helpers';
import { BFFApiUrls } from '../../config/api';
import { useDataApi } from './api.hook';

const pristineResponseData = apiPristineResponseData({
  BRP: null,
  AFVAL: null,
  HOME: null,
});

export type ServicesRelatedData = FEApiResponseData<typeof loadServicesRelated>;

const API_ID = 'SERVICES_RELATED';

export function useServicesRelated(postpone: boolean = false) {
  const [api] = useDataApi<ServicesRelatedData | typeof pristineResponseData>(
    {
      url: BFFApiUrls[API_ID],
      postpone,
    },
    pristineResponseData
  );

  return api;
}
