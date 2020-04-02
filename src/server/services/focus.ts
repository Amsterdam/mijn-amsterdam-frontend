import { ApiUrls } from '../../universal/config';
import { AxiosResponse } from 'axios';
import { requestSourceData } from '../../universal/helpers';

export interface FOCUSSourceData {}
export interface FOCUSData {}

function formatFOCUSData(response: AxiosResponse<FOCUSSourceData>): FOCUSData {
  return response.data;
}

export function fetchFOCUS() {
  return requestSourceData<FOCUSSourceData>({
    url: ApiUrls.FOCUS,
  }).then(formatFOCUSData);
}
