import { Request, Response } from 'express';
import { getApiConfig } from '../../config';
import { getProfileType } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';

type ParkerenUrlResponse = {
  url: string;
};

export async function fetchSSOParkerenURL(req: Request, res: Response) {
  const profileType = await getProfileType(req);
  const config = getApiConfig('PARKEREN', {
    transformResponse: (response: ParkerenUrlResponse) => response.url,
  });
  const base_route = '/sso/get_authentication_url?service=';

  switch (profileType) {
    case 'private': {
      config.url = `${config.url}${base_route}digid`;
      break;
    }
    case 'commercial': {
      config.url = `${config.url}${base_route}eherkenning`;
      break;
    }
    default: {
      console.error('No profile type found for Parkeren.');
      return null;
    }
  }

  const response = await requestData<ParkerenUrlResponse>(
    config,
    res.locals.requestID
  );

  return response;
}
