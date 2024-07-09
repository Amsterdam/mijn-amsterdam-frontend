import { ParsedQs } from 'qs';
import { BffEndpoints } from '../config';

export function getReturnToUrl(queryParams?: ParsedQs) {
  switch (queryParams?.returnTo) {
    case 'amsapp-stadspas-clientnummer':
      return BffEndpoints.STADSPAS_CLIENTNUMMER;
    default:
    case 'mams-landing':
      return BffEndpoints.AUTH_LOGIN_DIGID_LANDING;
  }
}
