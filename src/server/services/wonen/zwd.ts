import type { VvEDataFrontend, VvEDataSource } from './zwd.types.ts';
import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import { pick } from '../../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { getApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import type { BAGLocation } from '../bag/bag.types.ts';
import { fetchPrivate } from '../bag/my-locations.ts';

export function translateVerblijfObjectId(bagID: BAGID): BAGID {
  const bagIdTranslations = getFromEnv('BFF_BAG_TRANSLATIONS', false);
  // IS_PRODUCTION is explicitly set to exclude this code from being used in this environment.
  if (!bagIdTranslations || IS_PRODUCTION || !bagID) {
    return bagID;
  }

  const translationsMap = new Map(
    bagIdTranslations.split(',').map((pair) => pair.split('=')) as Iterable<
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
  const privateResponse = await fetchPrivate(authProfileAndToken);

  if (
    privateResponse.status !== 'OK' ||
    !privateResponse.content ||
    privateResponse.content.length === 0
  ) {
    throw new Error('BAG id not found in privateBAGResponse');
  }

  const privateAddresses: BAGLocation[] = privateResponse.content;
  const verblijfObjectId =
    privateAddresses?.[0]?.bagAddress?.verblijfsobjectIdentificatie;

  if (!verblijfObjectId) {
    throw new Error('BAG verblijfObjectId not found in privateBAGResponse');
  }

  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/api/v1/address/${translateVerblijfObjectId(verblijfObjectId)}/mijn-amsterdam/`;
    },
    transformResponse: transformZwdVvEResponse,
  };

  return fetchZWDAPI<VvEDataFrontend>(requestConfig);
}
