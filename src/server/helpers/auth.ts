import { ParsedQs } from 'qs';
import { BffEndpoints, ExternalConsumerEndpoints } from '../config';
import { generateFullApiUrlBFF } from './app';

export const RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER =
  'amsapp-stadspas-administratienummer';
export const RETURNTO_MAMS_LANDING = 'mams-landing';

export function getReturnToUrl(queryParams?: ParsedQs) {
  switch (queryParams?.returnTo) {
    case RETURNTO_AMSAPP_STADSPAS_ADMINISTRATIENUMMER:
      return generateFullApiUrlBFF(ExternalConsumerEndpoints.public.STADSPAS_ADMINISTRATIENUMMER, {
        token: queryParams['amsapp-session-token'] as string,
      });
    default:
    case RETURNTO_MAMS_LANDING:
      return BffEndpoints.AUTH_LOGIN_DIGID_LANDING;
  }
}
