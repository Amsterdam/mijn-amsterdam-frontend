import { ApiUrls } from '../../universal/config';
import { requestData } from '../helpers';

export interface ERFPACHTData {
  status: true;
}

export function fetchERFPACHT(sessionID: SessionID) {
  return requestData<ERFPACHTData>(
    {
      url: ApiUrls.ERFPACHT,
    },
    sessionID
  );
}
