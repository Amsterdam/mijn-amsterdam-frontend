import { ApiUrls } from '../../universal/config';
import { requestSourceData } from '../helpers';

export interface ERFPACHTData {
  status: true;
}

export function fetchERFPACHT() {
  return requestSourceData<ERFPACHTData>({
    url: ApiUrls.ERFPACHT,
  }).then(response => response.data);
}
