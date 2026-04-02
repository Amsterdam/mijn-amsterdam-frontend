import { featureToggle, ZWDApiReqestConfig } from './wonen-service-config.ts';
import type { VvEDataFrontend, ZwdVveDataSource } from './zwd.types.ts';
import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import { apiPostponeResult } from '../../../universal/helpers/api.ts';
import { pick } from '../../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import camelize from '../../helpers/camelize.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import type { BAGLocation } from '../bag/bag.types.ts';
import { fetchCommercial, fetchPrivate } from '../bag/my-locations.ts';

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
  const dataRequestConfigBase = getCustomApiConfig(
    ZWDApiReqestConfig,
    dataRequestConfigSpecific
  );
  return requestData<T>(dataRequestConfigBase);
}

function transformZwdVvEResponse(
  responseData: ZwdVveDataSource
): VvEDataFrontend {
  const responseDataPicked = pick(responseData, [
    'name',
    'bag_id',
    'monument_status',
    'number_of_apartments',
    'kvk_nummer',
    'district',
    'build_year',
    'ligt_in_beschermd_gebied',
    'beschermd_stadsdorpsgezicht',
  ]);
  const camelizedData: VvEDataFrontend = camelize(responseDataPicked);
  return camelizedData;
}

export async function fetchVVEData(authProfileAndToken: AuthProfileAndToken) {
  if (!featureToggle.service.fetchWonen.isEnabled) {
    return apiPostponeResult(null);
  }

  const service =
    authProfileAndToken.profile.profileType === 'private'
      ? fetchPrivate
      : fetchCommercial;

  const bagResponse = await service(authProfileAndToken);

  if (bagResponse.status !== 'OK') {
    // Propagate non-OK status (including dependency errors) from fetchPrivate
    return bagResponse;
  }
  if (!bagResponse.content || bagResponse.content.length === 0) {
    // No addresses found: treat as a dependency error instead of throwing
    return {
      ...bagResponse,
      status: 'DEPENDENCY_ERROR',
    };
  }

  const bagLocations: BAGLocation[] = bagResponse.content;
  const verblijfsobjectIdentificatie =
    bagLocations?.[0]?.bagAddress?.verblijfsobjectIdentificatie;

  if (!verblijfsobjectIdentificatie) {
    throw new Error(
      'BAG verblijfsobjectIdentificatie not found in privateBAGResponse'
    );
  }

  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/api/v1/address/${translateVerblijfObjectId(verblijfsobjectIdentificatie)}/mijn-amsterdam/`;
    },
    transformResponse: transformZwdVvEResponse,
  };

  return fetchZWDAPI<VvEDataFrontend>(requestConfig);
}
