import { AxiosResponse } from 'axios';
import { ApiUrls } from '../config/app';
import { requestSourceData } from '../helpers/requestSourceData';

export interface FOCUSSourceData {}
export interface FOCUSData {}

function formatFOCUSData(response: AxiosResponse<FOCUSSourceData>): FOCUSData {
  return response.data;
}

export function fetch() {
  return requestSourceData<FOCUSSourceData>({
    url: ApiUrls.FOCUS,
  }).then(formatFOCUSData);
}
