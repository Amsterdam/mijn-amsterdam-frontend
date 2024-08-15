import { Request, Response } from 'express';
import { AuthProfileAndToken, getProfileType } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';
import { getApiConfig } from '../../config';
import { fetchService } from '../simple-connect/api-service';

type ParkerenUrlResponse = {
  url: string;
};

export async function fetchParkeren(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
)
{
  fetchService(requestID
}


export async function fetchSSOParkerenURL(req: Request, res: Response) {
  const profileType = await getProfileType(req);
  const config = getApiConfig('PARKEREN', {
    transformResponse: (response: ParkerenUrlResponse) => response.url,
  });
  const base_route = '/sso/get_authentication_url?service=';

  switch (profileType) {
    case 'private': {
      config.url = `${config.url}${base_route}digid`;
      return requestData<ParkerenUrlResponse>(config, res.locals.requestID);
    }
    case 'commercial': {
      config.url = `${config.url}${base_route}eherkenning`;
      return requestData<ParkerenUrlResponse>(config, res.locals.requestID);
    }
  }
}
