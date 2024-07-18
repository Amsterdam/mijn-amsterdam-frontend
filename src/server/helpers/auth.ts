import { ParsedQs } from 'qs';
import {
  BFF_BASE_PATH,
  BffEndpoints,
  ExternalConsumerEndpoints,
} from '../config';
import { generateFullApiUrlBFF } from './app';
import { BFF_API_BASE_URL } from '../../client/config/api';

export const RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER =
  'amsapp-stadspas-administratienummer';
export const RETURNTO_MAMS_LANDING = 'mams-landing';

export function getReturnToUrl(queryParams?: ParsedQs) {
  switch (queryParams?.returnTo) {
    case RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER:
      return generateFullApiUrlBFF(
        ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER,
        {
          token: queryParams['amsapp-session-token'] as string,
        },
        BFF_API_BASE_URL.replace(BFF_BASE_PATH, '') // The STADSPAS_ADMINISTRATIENUMMER path already has /api/v1 in it
      );
    default:
    case RETURNTO_MAMS_LANDING:
      return BffEndpoints.AUTH_LOGIN_DIGID_LANDING;
  }
}
