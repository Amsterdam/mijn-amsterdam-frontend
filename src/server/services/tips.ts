import { ApiUrls, getApiConfigValue } from './config';

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

function transformTIPSRequest(requestData: TIPSData) {
  return requestData;
}

export function fetchTIPS(sessionID: SessionID, requestBody: TIPSRequestData) {
  return requestData<TIPSData>(
    {
      url: ApiUrls.TIPS,
      method: 'POST',
      data: requestBody,
      transformRequest: transformTIPSRequest,
    },
    sessionID,
    getApiConfigValue('TIPS', 'postponeFetch', false)
  );
}
