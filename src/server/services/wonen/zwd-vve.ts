import { ZwedVvEResponseType, VvEData } from './zwd-vve.types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { apiPostponeResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BAGLocation } from '../bag/bag.types';
import { fetchMyLocation } from '../bag/my-locations';

async function fetchZWDAPI<T>(dataRequestConfigSpecific: DataRequestConfig) {
  const dataRequestConfigBase = getApiConfig(
    'ZWD_VVE',
    dataRequestConfigSpecific
  );
  return requestData<T>(dataRequestConfigBase);
}

function transformZwedVvEResponse(responseData: ZwedVvEResponseType) {
  console.log('____________transformZwedVvEResponse', responseData);

  if (responseData) {
    return responseData;
  }
  return [];
}
//   "message": "HomeownerAssociation with bag ID 0363010000801903 not found."

export async function fetchVVEData(authProfileAndToken: AuthProfileAndToken) {
  if (!FeatureToggle.vveIsActive) {
    return apiPostponeResult(null);
  }

  const base64encodedPK = getFromEnv('BFF_VVE_API_TOKEN');
  if (!base64encodedPK) {
    throw new Error('BFF_VVE_API_TOKEN not found');
  }

  const privateBAGResponse = await fetchMyLocation(authProfileAndToken);

  const privateAddresses: BAGLocation[] = privateBAGResponse.content ?? [];
  console.log(
    '_________________privateAddresses',
    privateAddresses[0]?.bagAddress?.verblijfsobjectIdentificatie
  );

  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/api/v1/address/${privateAddresses[0].bagAddress?.verblijfsobjectIdentificatie}/homeowner-association/`;

    },
    transformResponse: transformZwedVvEResponse,
    // cacheKey_UNSAFE: createSessionBasedCacheKey(
    //   authProfileAndToken.profile.sid
    // ),
  };

  return fetchZWDAPI<VvEData>(requestConfig);
}
