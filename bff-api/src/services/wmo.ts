import { AxiosResponse } from 'axios';
import { ApiUrls } from '../config/app';
import { requestSourceData } from '../helpers/requestSourceData';

export interface WMOSourceData {}
export interface WMOData {}

function formatWMOData(response: AxiosResponse<WMOSourceData>): WMOData {
  return response.data;
}

export function fetch() {
  return requestSourceData<WMOSourceData>({
    url: ApiUrls.WMO,
  }).then(formatWMOData);
}
