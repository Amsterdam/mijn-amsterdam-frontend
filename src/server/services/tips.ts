import { ApiResponse } from '../../universal/helpers';
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
  return servicesResults.reduce(
    (acc, result) => Object.assign(acc, extractSuccessResponseContent(result)),
    {}
  );
}

export async function loadServicesTips(
  sessionID: SessionID,
  samlToken: string,
  servicesResults: ServiceResults,
  optin: boolean = false
) {
  const tipsRequestData: TIPSRequestData = {
    data: createTipsRequestDataFromServiceResults(servicesResults),
    optin,
  };

  return {
    TIPS: await fetchTIPS(sessionID, samlToken, tipsRequestData),
  };
}
