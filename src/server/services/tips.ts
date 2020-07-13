import { ApiResponse, deepOmitKeys } from '../../universal/helpers';
import { MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { ApiStateKey } from './state';

export type TIPSData = MyTip[];

export interface TIPSRequestData {
  optin: boolean;
  data: any;
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

type ServiceResults = Array<Record<string, ApiResponse<any>>>;

function extractSuccessResponseContent(
  serviceResult: Record<ApiStateKey, ApiResponse<any>>
) {
  const responseContent: Record<string, any> = {};

  for (const [apiStateKey, response] of Object.entries(serviceResult)) {
    if (response.status === 'OK') {
      responseContent[apiStateKey] = response.content;
    }
  }

  return responseContent;
}

function createTipsRequestDataFromServiceResults(
  servicesResults: ServiceResults
) {
  return servicesResults.reduce((acc, result) => {
    const data = extractSuccessResponseContent(result);
    return Object.assign(acc, deepOmitKeys(data, ['description']));
  }, {});
}

export async function loadServicesTips(
  sessionID: SessionID,
  samlToken: string,
  servicesResults: ServiceResults,
  optin: boolean = false
) {
  const data = createTipsRequestDataFromServiceResults(servicesResults);
  const tipsRequestData: TIPSRequestData = {
    data,
    optin,
  };

  return {
    TIPS: await fetchTIPS(sessionID, samlToken, tipsRequestData),
  };
}
