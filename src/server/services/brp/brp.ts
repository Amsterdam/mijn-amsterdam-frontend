import { ONE_HOUR_MS } from '../../config/app';
import { getFromEnv } from '../../helpers/env';
import { fetchAuthTokenHeader } from '../ms-oauth/oauth-token';

const TOKEN_VALIDITY_PERIOD = 24 * ONE_HOUR_MS;
const PERCENTAGE_DISTANCE_FROM_EXPIRY = 0.1;

function fetchBenkBrpTokenHeader() {
  return fetchAuthTokenHeader(
    {
      serviceID: 'BRP',
      tokenValidityMS:
        TOKEN_VALIDITY_PERIOD * (1 - PERCENTAGE_DISTANCE_FROM_EXPIRY),
    },
    {
      clientID: getFromEnv('BFF_BENK_BRP_CLIENT_ID') ?? '',
      clientSecret: getFromEnv('BFF_BENK_BRP_CLIENT_SECRET') ?? '',
      tenantID: getFromEnv('BFF_BENK_BRP_TENANT') ?? '',
      scope: `${getFromEnv('BFF_BENK_BRP_APPLICATION_ID')}/.default`,
    }
  );
}
