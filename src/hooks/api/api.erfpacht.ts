import { getApiUrl } from 'helpers/App';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';

interface ErfpachtApiResponse {
  status: boolean;
}

export interface ErfpachtApiState extends ApiState {
  data: ErfpachtApiResponse;
}

export default function useErfpachtApi(): ErfpachtApiState {
  const [api] = useDataApi({
    url: getApiUrl('ERFPACHT'),
  });
  return api;
}
