import { ApiResponse, deepOmitKeys } from '../../universal/helpers';
import { MyTip } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { ApiStateKey } from './state';
import { Request } from 'express';
import { getPassthroughRequestHeaders } from '../helpers/app';
import { loadServicesDirect } from './services-direct';
import { loadServicesRelated } from './services-related';

export type TIPSData = MyTip[];

export interface TIPSParams {
  optin: boolean;
  profileType?: ProfileType;
}

export interface TIPSRequestData {
  optin: boolean;
  profileType?: ProfileType;
  data?: any;
}

export function getTipsRequestParams(req: Request) {
  const params: TIPSParams = {
    optin: req.query.optin === 'true',
  };
  if (req.query.profileType) {
    params.profileType = req.query.profileType as ProfileType;
  }
  return params;
}

export async function fetchTIPS(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  requestBody: TIPSRequestData | null
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

export async function loadServicesTips(sessionID: string, req: Request) {
  const passthroughRequestHeaders = getPassthroughRequestHeaders(req);
  const params = getTipsRequestParams(req);

  const tipsRequestData: TIPSRequestData = {
    optin: !!params.optin,
  };

  if (params.optin) {
    const tipsRequestDataServiceResults = await Promise.all([
      loadServicesDirect(sessionID, passthroughRequestHeaders),
      loadServicesRelated(sessionID, passthroughRequestHeaders),
    ]);

    const data = createTipsRequestDataFromServiceResults(
      tipsRequestDataServiceResults
    );

    tipsRequestData.data = data;

    if (params.profileType) {
      tipsRequestData.profileType = params.profileType;
    }
  }

  const TIPS = await fetchTIPS(
    sessionID,
    passthroughRequestHeaders,
    tipsRequestData
  );

  return {
    TIPS,
  };
}
