import { MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
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
    getApiConfig('TIPS', {
      method: 'POST',
      data: requestBody,
    }),
    sessionID,
    samlToken
  );
}
