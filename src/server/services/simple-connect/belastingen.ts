import fs from 'fs';
import https from 'https';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchService } from './api-service';

const httpsAgent = new https.Agent({
  ca: fs.readFileSync('/etc/ssl/certs/ca-certificates.crt'),
});

export function fetchBelastingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const requestConfig = {
    url: process.env.BFF_BELASTINGEN_ENDPOINT,
    httpsAgent,
    headers: {
      Authorization: `Bearer ${process.env.BFF_BELASTINGEN_TOKEN}`,
      subjid: authProfileAndToken.profile.id || '',
    },
  };

  console.log(requestConfig);

  return fetchService(requestID, authProfileAndToken, requestConfig);
}
