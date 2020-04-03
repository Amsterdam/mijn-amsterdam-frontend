import { ApiUrls, BFFApiData } from '../../universal/config';

import { AxiosResponse } from 'axios';
import { LinkProps } from '../../universal/types/App.types';
import { requestSourceData } from '../../universal/helpers';

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

interface TIPSRequestData {
  optin: boolean;
  data: Partial<BFFApiData>;
}

function formatTIPSData(response: AxiosResponse<TIPSData>) {
  return response.data;
}

export function fetchTIPS(requestData: TIPSRequestData) {
  return requestSourceData<TIPSData>({
    url: ApiUrls.TIPS,
    method: 'POST',
    data: requestData,
  }).then(formatTIPSData);
}
