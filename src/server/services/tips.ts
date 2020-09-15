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
  audience: 'persoonlijk' | 'persoonlijk,zakelijk' | 'zakelijk';
}

export interface TIPSRequestData extends TIPSParams {
  userData?: any;
  tips?: MyTip[];
}

export function getTipsRequestParams(req: Request) {
  const params: TIPSParams = {
    optin: req.query.optin === 'true',
    audience: 'persoonlijk',
  };
  if (req.query.profileType) {
    switch (req.query.profileType) {
      case 'private-commercial':
        params.audience = 'persoonlijk,zakelijk';
        break;
      case 'commercial':
        params.audience = 'zakelijk';
        break;
    }
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
  const tips = [];
  const userData = {};

  for (const result of servicesResults) {
    const data = extractSuccessResponseContent(result);
    Object.assign(userData, deepOmitKeys(data, ['description']));
    const tipsFromSource = Object.values(data).flatMap(data =>
      data && 'tips' in data ? data['tips'] : []
    );
    if (tipsFromSource.length) {
      tips.push(...tipsFromSource);
    }
  }
  return {
    userData,
    tips,
  };
}

export async function loadServicesTips(sessionID: string, req: Request) {
  const passthroughRequestHeaders = getPassthroughRequestHeaders(req);
  const params = getTipsRequestParams(req);

  const tipsRequestData: TIPSRequestData = {
    ...params,
  };

  if (params.optin) {
    const tipsRequestDataServiceResults = await Promise.all([
      loadServicesDirect(sessionID, passthroughRequestHeaders),
      loadServicesRelated(sessionID, passthroughRequestHeaders),
    ]);

    const requestData = createTipsRequestDataFromServiceResults(
      tipsRequestDataServiceResults
    );

    Object.assign(tipsRequestData, requestData);
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
