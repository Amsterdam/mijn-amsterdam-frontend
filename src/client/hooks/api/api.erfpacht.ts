import { ApiState } from './api.types';
import { getApiUrl } from '../../../universal/helpers';
import { useDataApi } from './api.hook';

interface ErfpachtApiResponse {
  status: boolean;
}

export type ErfpachtApiState = ApiState<ErfpachtApiResponse>;

export default function useErfpachtApi(): ErfpachtApiState {
  const [api] = useDataApi<ErfpachtApiResponse>(
    {
      url: getApiUrl('ERFPACHT'),
    },
    { status: false }
  );
  return api;
}
