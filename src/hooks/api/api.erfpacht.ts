import { getApiUrl } from 'helpers/App';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';

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
