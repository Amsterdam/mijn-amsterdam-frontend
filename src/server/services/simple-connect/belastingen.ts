import { AuthProfileAndToken } from '../../helpers/app';
import { fetchService } from './api-service';

export function fetchBelastingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const requestConfig = {
    // (verify = '/etc/ssl/certs/ca-certificates.crt')
    headers: {
      Authorization: `Bearer ${process.env.BFF_BELASTINGEN_TOKEN}`,
      subjid: authProfileAndToken.profile.id || '',
    },
  };

  return fetchService(requestID, authProfileAndToken, requestConfig);
}
