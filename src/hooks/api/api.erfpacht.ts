import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';
import { ApiState } from './api.types';

interface ErfpachtApiResponse {
  status: boolean;
}

export interface ErfpachtApiState extends ApiState {
  data: ErfpachtApiResponse;
}

export default function useErfpachtApi(): ErfpachtApiState {
  const [api] = useDataApi({
    url: ApiUrls.ERFPACHT,
  });
  return {
    ...api,
    data: api.data,
  };
}
