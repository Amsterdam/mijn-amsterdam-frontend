import { ApiUrls, getApiConfigValue } from '../config';

import { MyTip } from '../../universal/types';
import { requestData } from '../helpers';

export interface TIPSData {
  items: MyTip[];
}

export interface TIPSRequestData {
  optin: boolean;
  data: any;
  tips: MyTip[];
}

export function fetchTIPS(
  sessionID: SessionID,
  samlToken: string,
  requestBody: TIPSRequestData
) {
  return requestData<TIPSData>(
    {
      url: ApiUrls.TIPS,
      method: 'POST',
      data: requestBody,
    },
    sessionID,
    samlToken,
    getApiConfigValue('TIPS', 'postponeFetch', false)
  );
}
