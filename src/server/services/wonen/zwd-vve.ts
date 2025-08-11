import { ZwedVvEResponseType, VvEData } from './zwd-vve.types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
} from '../../../universal/config/myarea-datasets';
import {
  apiDependencyError,
  apiPostponeResult,
  ApiResponse_DEPRECATED,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { isMokum } from '../../../universal/helpers/brp';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getFromEnv } from '../../helpers/env';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { fetchBAG } from '../bag/bag';
import { BAGData } from '../bag/bag.types';
import { fetchBRP } from '../profile/brp';

async function fetchZWDAPI<T>(dataRequestConfigSpecific: DataRequestConfig) {
  const dataRequestConfigBase = getApiConfig(
    'ZWD_VVE',
    dataRequestConfigSpecific
  );
  return requestData<T>(dataRequestConfigBase);
}

function transformZwedVvEResponse(responseData: ZwedVvEResponseType) {
  if (responseData) {
    return responseData;
  }
  return [];
}

async function fetchPrivateBAG(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse_DEPRECATED<BAGData[] | null>> {
  const BRP = await fetchBRP(authProfileAndToken);

  if (BRP.status === 'OK') {
    if (isMokum(BRP.content)) {
      const BAGLocation = (await fetchBAG(BRP.content.adres))?.content;
      // console.log('BAGLocation', BAGLocation);

      if (!BAGLocation?.bagAddress?.verblijfsobjectIdentificatie) {
        return apiSuccessResult([
          {
            latlng: {
              lat: DEFAULT_LAT,
              lng: DEFAULT_LNG,
            },
            address: null,
            bagAddress: null,
            profileType: 'private',
          },
        ]);
      }
      return apiSuccessResult([
        Object.assign(BAGLocation, { profileType: 'private' }),
      ]);
    }
    return apiSuccessResult([
      {
        latlng: null,
        address: null,
        bagAddress: null,
        profileType: 'private',
      },
    ]);
  }

  return apiDependencyError({ BRP });
}

// in bag adres type toevoegen

export async function fetchVVEData(authProfileAndToken: AuthProfileAndToken) {
  if (!FeatureToggle.vveIsActive) {
    return apiPostponeResult(null);
  }

  const base64encodedPK = getFromEnv('BFF_VVE_API_TOKEN');
  if (!base64encodedPK) {
    throw new Error('BFF_VVE_API_TOKEN not found');
  }

  const privateBAGResponse = await fetchPrivateBAG(authProfileAndToken);
  const privateAddresses: BAGData[] = privateBAGResponse.content ?? [];
  console.log(
    'privateAddresses',
    privateAddresses[0]?.bagAddress?.verblijfsobjectIdentificatie
  );
  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      // return `${url}/api/v1/address/`;
      return `${url}/api/v1/address/${privateAddresses[0].bagAddress?.verblijfsobjectIdentificatie}/homeowner-association/`;
    },
    transformResponse: transformZwedVvEResponse,
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid
    ),
  };
  return fetchZWDAPI<VvEData>(requestConfig);
}
