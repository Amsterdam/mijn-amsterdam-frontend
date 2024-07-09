import { ParsedQs } from 'qs';
import { BffEndpoints } from '../config';
import { generateFullApiUrlBFF } from './app';

export const RETURNTO_AMSAPP_STADSPAS_CLIENTNUMMER =
  'amsapp-stadspas-clientnummer';
export const RETURNTO_MAMS_LANDING = 'mams-landing';

export function getReturnToUrl(queryParams?: ParsedQs) {
  switch (queryParams?.returnTo) {
    case RETURNTO_AMSAPP_STADSPAS_CLIENTNUMMER:
      return generateFullApiUrlBFF(BffEndpoints.STADSPAS_CLIENTNUMMER);
    default:
    case RETURNTO_MAMS_LANDING:
      return generateFullApiUrlBFF(BffEndpoints.AUTH_LOGIN_DIGID_NO_API_PREFIX);
  }
}
