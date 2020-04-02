import { ApiUrls } from '../config/app';
import { requestSourceData } from '../helpers/requestSourceData';

export interface ERFPACHTData {
  status: true;
}

export function fetch() {
  return requestSourceData<ERFPACHTData>({
    url: ApiUrls.ERFPACHT,
  }).then(response => response.data);
}
