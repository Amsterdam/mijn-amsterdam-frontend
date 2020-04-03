import { ApiState } from './api.types';
import { BFFApiUrls } from '../../../universal/config';
import { UPDATESData } from '../../../server/services/services-notifications';
import { getApiConfigValue } from '../../../universal/helpers';
import { useDataApi } from './api.hook';

export type ServicesUpdatesData = UPDATESData;
export type ServicesUpdatesApiState = ApiState<ServicesUpdatesData>;

const API_ID = 'SERVICES_UPDATES';

export function useServicesUpdates(): ServicesUpdatesApiState {
  const [api] = useDataApi<ServicesUpdatesData>(
    {
      url: BFFApiUrls[API_ID],
      postpone: getApiConfigValue(API_ID, 'postponeFetch', false),
    },
    { items: [], total: 0 }
  );

  return api;
}
