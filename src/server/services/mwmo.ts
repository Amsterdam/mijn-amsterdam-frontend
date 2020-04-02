import { ApiUrls } from '../../universal/config';
import { AxiosResponse } from 'axios';
import { requestSourceData } from '../../universal/helpers';

export interface WMOSourceData {}
export interface WMOData {}

function formatWMOData(response: AxiosResponse<WMOSourceData>): WMOData {
  return response.data;
}

export function fetchWMO() {
  return requestSourceData<WMOSourceData>({
    url: ApiUrls.WMO,
  }).then(formatWMOData);
}
