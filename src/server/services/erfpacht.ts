import { ApiUrls, getApiConfigValue } from '../config';
import { requestData } from '../helpers';

interface ERFPACHTSourceData {
  status: boolean;
}

export interface ERFPACHTData {
  isKnown: boolean;
}

function transformResponse(data: ERFPACHTSourceData): ERFPACHTData {
  return { isKnown: data.status };
}

export function fetchERFPACHT(sessionID: SessionID) {
  return requestData<ERFPACHTData>(
    {
      url: ApiUrls.ERFPACHT,
      transformResponse,
    },
    sessionID,
    getApiConfigValue('ERFPACHT', 'postponeFetch', false)
  );
}
