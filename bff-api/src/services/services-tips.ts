import { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { LinkProps } from '../../../src/App.types';
import { ApiUrls, UserData } from '../config/app';
import { requestSourceData } from '../helpers/requestSourceData';
import { loadUserData as loadServicesDirect } from './services-direct';
import { loadUserData as loadServicesRelated } from './services-related';

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
  data: Partial<UserData>;
}

function formatTIPSData(response: AxiosResponse<TIPSData>) {
  return response.data.items;
}

function fetch(requestData: TIPSRequestData) {
  return requestSourceData<TIPSData>({
    url: ApiUrls.TIPS,
    method: 'POST',
    data: requestData,
  }).then(formatTIPSData);
}

export async function handleRoute(req: Request, res: Response) {
  const relatedServicesData = await loadServicesRelated(req.sessionID!);
  const directServicesData = await loadServicesDirect(req.sessionID!);

  const tips = await fetch({
    optin: !!req.cookies?.optInPersonalizedTips,
    data: {
      ...relatedServicesData,
      ...directServicesData,
    },
  });

  return res.send(tips);
}
