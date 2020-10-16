import { ApiResponse, deepOmitKeys } from '../../universal/helpers';
import { MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

export type TIPSData = MyTip[];

export interface TIPSParams {
  audience: 'persoonlijk' | 'persoonlijk,zakelijk' | 'zakelijk';
}

export interface TIPSRequestData {
  optin: boolean;
  userData?: any;
  tips?: MyTip[];
}

export function getTipsRequestParams(requestParams: Record<string, string>) {
  const params: TIPSParams = {
    audience: 'persoonlijk',
  };
  if (requestParams.profileType) {
    switch (requestParams.profileType) {
      case 'private-commercial':
      case 'commercial':
        params.audience = 'zakelijk';
        break;
    }
  }
  return params;
}

type ServiceResults = { [serviceId: string]: ApiResponse<any> };

function extractSuccessResponseContent(
  serviceResult: Record<string, ApiResponse<any>>
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
  const tips = [];
  const userData = {};

  const data = extractSuccessResponseContent(servicesResults);
  // Omit all description keys, these are not needed for the Tips service.
  Object.assign(userData, deepOmitKeys(data, ['description']));
  const tipsFromSource = Object.values(data).flatMap(data =>
    data && 'tips' in data ? data['tips'] : []
  );
  if (tipsFromSource.length) {
    tips.push(...tipsFromSource);
  }

  return {
    userData,
    tips,
  };
}

export async function fetchTIPS(
  sessionID: string,
  passthroughRequestHeaders: Record<string, string>,
  requestParams: Record<string, string>,
  serviceResults: ServiceResults | null
) {
  const params = getTipsRequestParams(requestParams);
  const optin = requestParams.optin === 'true';
  const tipsRequestData: TIPSRequestData = {
    optin,
  };

  if (optin && serviceResults) {
    Object.assign(
      tipsRequestData,
      createTipsRequestDataFromServiceResults(serviceResults)
    );
  }

  return requestData<TIPSData>(
    getApiConfig('TIPS', {
      method: 'POST',
      data: tipsRequestData,
      params,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
