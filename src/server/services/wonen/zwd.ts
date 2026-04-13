import { HttpStatusCode } from 'axios';

import { featureToggle, ZWDApiReqestConfig } from './wonen-service-config.ts';
import type { VvEDataFrontend, ZwdVveDataSource } from './zwd.types.ts';
import { IS_PRODUCTION } from '../../../universal/config/env.ts';
import {
  apiErrorResult,
  apiPostponeResult,
} from '../../../universal/helpers/api.ts';
import { pick } from '../../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type {
  DataRequestConfig,
  DataRequestHeaders,
} from '../../config/source-api.ts';
import camelize from '../../helpers/camelize.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import {
  isSuccessStatus,
  requestData,
} from '../../helpers/source-api-request.ts';
import type { BAGID, BAGLocation } from '../bag/bag.types.ts';
import { fetchCommercial, fetchPrivate } from '../bag/my-locations.ts';

export function translateVerblijfObjectId(bagID: BAGID): BAGID {
  const bagIdTranslations = getFromEnv('BFF_BAG_TRANSLATIONS', false);
  // IS_PRODUCTION is explicitly set to exclude this code from being used in this environment.
  if (!bagIdTranslations || IS_PRODUCTION) {
    return bagID;
  }

  const translationsMap = new Map(
    bagIdTranslations.split(',').map((pair) => pair.split('=')) as Iterable<
      [string, string]
    >
  );

  return translationsMap.get(bagID) ?? bagID;
}

async function fetchZWDAPI<T>(dataRequestConfigSpecific: DataRequestConfig) {
  const dataRequestConfigBase = getCustomApiConfig(
    ZWDApiReqestConfig,
    dataRequestConfigSpecific
  );
  return requestData<T>(dataRequestConfigBase);
}

function transformZwdVvEResponse(
  responseData: ZwdVveDataSource,
  _headers: DataRequestHeaders,
  status: number
): VvEDataFrontend | null {
  if (status === HttpStatusCode.NotFound) {
    // Return null if the record is not found, this is handled as a valid case in the frontend.
    return null;
  }

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

  if (
    bagResponse.status == 'ERROR' ||
    !bagResponse.content ||
    bagResponse.content.length === 0
  ) {
    return apiErrorResult(
      bagResponse.status === 'ERROR'
        ? bagResponse.message
        : 'No BAG locations found for the user',
      null
    );
  }

  const bagLocations: BAGLocation[] = bagResponse.content;
  const verblijfsobjectIdentificatie =
    bagLocations?.[0]?.bagAddress?.verblijfsobjectIdentificatie;

  if (!verblijfsobjectIdentificatie) {
    return apiErrorResult(
      'No valid BAG verblijfsobjectIdentificatie found for the primary BAG location of the user',
      null
    );
  }

  const requestConfig: DataRequestConfig = {
    formatUrl({ url }) {
      return `${url}/api/v1/address/${translateVerblijfObjectId(verblijfsobjectIdentificatie)}/mijn-amsterdam/`;
    },
    transformResponse: transformZwdVvEResponse,
    validateStatus(status) {
      return (
        isSuccessStatus(status) ||
        // 404 means there is no record available in the ZWD api for the requested verblijfsobjectIdentificatie.
        status === HttpStatusCode.NotFound
      );
    },
  };

  return fetchZWDAPI<VvEDataFrontend>(requestConfig);
}
