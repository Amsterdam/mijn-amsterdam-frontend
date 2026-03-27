import type { VvEDataFrontend, VvEDataSource } from './zwd.types.ts';
import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import { FeatureToggle } from '../../../universal/config/feature-toggles.ts';
import { apiPostponeResult } from '../../../universal/helpers/api.ts';
import { pick } from '../../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import type { BAGLocation } from '../bag/bag.types.ts';
import { fetchMyLocations } from '../bag/my-locations.ts';

export function translateVerblijfObject(bagID: BAGID): BAGID {
  const translations = getFromEnv('BFF_BAG_TRANSLATIONS', false);
  // IS_PRODUCTION is explicitly set to exclude this code from being used in this environment.
  if (!translations || IS_PRODUCTION || !bagID) {
    return bagID;
  }

  const translationsMap = new Map(
    translations.split(',').map((pair) => pair.split('=')) as Iterable<
      [string, string]
    >
  );

  return translationsMap.get(bagID) ?? bagID;
}
type BAGID = string | null | undefined;

async function fetchZWDAPI<T>(dataRequestConfigSpecific: DataRequestConfig) {
  const dataRequestConfigBase = getApiConfig(
    'ZWD_VVE',
    dataRequestConfigSpecific
  );
  return requestData<T>(dataRequestConfigBase);
}

function transformZwdVvEResponse(responseData: VvEDataSource) {
  return pick(responseData, [
    'name',
    'monument_status',
    'number_of_apartments',
    'kvk_number',
    'district',
    'build_year',
    'is_priority_neighborhood',
    'ligt_in_beschermd_gebied',
    'beschermd_stadsdorpsgezicht',
  ]) as VvEDataSource;
}

export async function fetchVVEData(authProfileAndToken: AuthProfileAndToken) {
  if (!FeatureToggle.vveIsActive) {
    return apiPostponeResult(null);
  }
  
  const privateBAGResponse = await fetchMyLocations(authProfileAndToken);
  
  if (
    privateBAGResponse.status !== 'OK' ||
    !privateBAGResponse.content ||
    privateBAGResponse.content.length === 0
  ) {
    throw new Error('BAG id not found in privateBAGResponse');
  }
  
  const privateAddresses: BAGLocation[] = privateBAGResponse.content;

  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/api/v1/address/${translateVerblijfObject(privateAddresses[0].bagAddress?.verblijfsobjectIdentificatie)}/mijn-amsterdam/`;
    },
    transformResponse: transformZwdVvEResponse,
  };

  return fetchZWDAPI<VvEDataFrontend>(requestConfig);
}
