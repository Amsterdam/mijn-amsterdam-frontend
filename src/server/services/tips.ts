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

export async function fetchTIPS(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  requestBody: TIPSRequestData
) {
  return requestData<TIPSData>(
    getApiConfig('TIPS', {
      method: 'POST',
      data: requestBody,
    }),
    sessionID,
    passthroughRequestHeaders
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
  passthroughRequestHeaders: Record<string, string>,
  servicesResults: ServiceResults,
  optin: boolean = false
) {
  const data = createTipsRequestDataFromServiceResults(servicesResults);
  const tipsRequestData: TIPSRequestData = {
    data,
    optin,
  };

  const TIPS = await fetchTIPS(
    sessionID,
    passthroughRequestHeaders,
    tipsRequestData
  );

  return {
    TIPS,
  };
}
