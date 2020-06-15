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

export function fetchERFPACHT(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  return requestData<ERFPACHTData>(
    {
      url: ApiUrls.ERFPACHT,
      transformResponse: (responseData: ERFPACHTSourceData) =>
        raw ? responseData : transformResponse(responseData),
    },
    sessionID,
    samlToken,
    getApiConfigValue('ERFPACHT', 'postponeFetch', false)
  );
}
