import { ApiUrls } from '../../universal/config';
import { requestData } from '../helpers';

export interface ERFPACHTData {
  status: true;
}

export function fetchERFPACHT() {
  return requestData<ERFPACHTData>({
    url: ApiUrls.ERFPACHT,
  });
}
