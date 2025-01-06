import memoizee from 'memoizee';

import { ContactMoment, ContactMomentenResponse } from './types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

// See also: https://www.amsterdam.nl/wonen-leefomgeving/wonen/bedandbreakfast/oude-regels/

function fetchPowerBrowserToken_(requestID: RequestID) {
  const requestConfig = getApiConfig('SALESFORCE', {
    formatUrl({ url }) {
      return `${url}/Token`;
    },
    responseType: 'text',
    data: {
      apiKey: process.env.BFF_POWERBROWSER_TOKEN_API_KEY,
    },
  });
  return requestData<string>(requestConfig, requestID);
}

const fetchPowerBrowserToken = memoizee(fetchPowerBrowserToken_);

async function fetchSalesforceData<T>(
  requestID: RequestID,
  dataRequestConfigSpecific: DataRequestConfig
) {
  const tokenResponse = await fetchPowerBrowserToken(requestID);
  const dataRequestConfigBase = getApiConfig(
    'SALESFORCE',
    dataRequestConfigSpecific
  );
  const dataRequestConfig = {
    ...dataRequestConfigBase,
    headers: {
      Authorization: `Bearer ${tokenResponse.content}`,
      ...dataRequestConfigBase.headers,
    },
  };

  return requestData<T>(dataRequestConfig, requestID);
}

async function fetchSalesforceData2<T>(
  requestID: RequestID,
  dataRequestConfigSpecific: DataRequestConfig
) {
  const dataRequestConfigBase = getApiConfig(
    'SALESFORCE',
    dataRequestConfigSpecific
  );

  return requestData<T>(dataRequestConfigBase, requestID);
}

export async function fetchContactmomenten(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/contactmomenten/services/apexrest/klantinteracties/v1.0/klantcontacten/`;
    },
    params: {
      hadBetrokkene__uuid: authProfileAndToken.profile.id,
    },
    transformResponse(responseData: ContactMomentenResponse) {
      return responseData.results ?? null;
    },
  };
  return fetchSalesforceData2<ContactMoment[] | null>(requestID, requestConfig);
}
