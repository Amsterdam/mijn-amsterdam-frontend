import fs from 'fs';
import https from 'https';
import { DataRequestConfig } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchService } from './api-service';

const httpsAgent = new https.Agent({
  ca: fs.readFileSync('/etc/ssl/certs/ca-certificates.crt'),
});

function getBsnTranslations() {
  const translationsJson = process.env.BFF_BELASTINGEN_BSN_TRANSLATIONS;
  console.log('translationsJson', translationsJson);
}

export function fetchBelastingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const requestConfig: DataRequestConfig = {
    url: process.env.BFF_BELASTINGEN_ENDPOINT,
    httpsAgent,
    headers: {
      Authorization: `Bearer ${process.env.BFF_BELASTINGEN_BEARER_TOKEN}`,
      subjid: authProfileAndToken.profile.id || '',
    },
    transformResponse: (response) => {
      getBsnTranslations();
      console.log('resp', response);
      return response;
    },
  };

  // console.log(requestConfig);

  return fetchService(requestID, authProfileAndToken, requestConfig);
}
