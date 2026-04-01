import { VvEDataSource } from './zwd.types';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { apiPostponeResult } from '../../../universal/helpers/api';
import { pick } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DataRequestConfig } from '../../config/source-api';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { BAGLocation } from '../bag/bag.types';
import { fetchMyLocations } from '../bag/my-locations';

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

  return fetchZWDAPI<VvEDataSource>(requestConfig);
}
