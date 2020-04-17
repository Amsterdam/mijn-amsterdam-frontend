import { ApiUrls, BFFApiData } from '../../universal/config';

import { LinkProps } from '../../universal/types/App.types';
import { requestData } from '../helpers';

export interface MyTip {
  datePublished: string;
  title: string;
  subtitle: string;
  description: string;
  link: LinkProps;
  imgUrl?: string;
  isPersonalized: boolean;
  priority?: number;
}

export interface TIPSData {
  items: MyTip[];
}

export interface TIPSRequestData {
  optin: boolean;
  data: Partial<BFFApiData>;
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
    sessionID
  );
}
