import { HttpStatusCode } from 'axios';

import { featureToggle, ZWDApiReqestConfig } from './wonen-service-config.ts';
import type {
  VveCaseDetail,
  VvEDataFrontend,
  ZwdVveDataSource,
} from './zwd.types.ts';
import { themaConfig } from '../../../client/apps/bob/pages/Thema/Profile/Profile-thema-config.ts';
import {
  apiErrorResult,
  apiPostponeResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import { pick } from '../../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type {
  DataRequestConfig,
  DataRequestHeaders,
} from '../../config/source-api.ts';
import { camelize } from '../../helpers/camelize.ts';
import { translateValueFromEnv } from '../../helpers/env.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import {
  isSuccessStatus,
  requestData,
} from '../../helpers/source-api-request.ts';
import type { BAGID, BAGLocation } from '../bag/bag.types.ts';
import { fetchCommercial, fetchPrivate } from '../bag/my-locations.ts';

export function translateVerblijfObjectId(bagID: BAGID): BAGID {
  return translateValueFromEnv('BFF_BAG_TRANSLATIONS', bagID);
}

async function fetchZWDAPI<T>(dataRequestConfigSpecific: DataRequestConfig) {
  const dataRequestConfigBase = getCustomApiConfig(
    ZWDApiReqestConfig,
    dataRequestConfigSpecific
  );
  return requestData<T>(dataRequestConfigBase);
}

function TransformZWDCases(cases: ZwdVveDataSource['cases']): VveCaseDetail[] {
  if (!cases || !cases.length) {
    return [];
  }

  return cases.map((c) => ({
    id: String(c.id),
    title: 'VvE verduurzamingsadvies',
    steps: [],
    link: {
      to: themaConfig.BRP.detailPageVvE.route.path,
      title: 'Bekijk details',
    },
    displayStatus: c.status,
    dateStart: c.created,
    formattedDateStart: defaultDateFormat(c.created),
    dateUpdated: c.updated,
    datePublished: c.updated,
    status: c.status,
    adviceType: c.advice_type,
    homeownerAssociation: {
      name: c.homeowner_association.name,
    },
  }));
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
    'is_priority_neighborhood',
  ]);

  const camelizedData: VvEDataFrontend = {
    ...camelize(responseDataPicked),
    cases: TransformZWDCases(responseData.cases),
  };

  return camelizedData;
}

export async function fetchVVEData(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<VvEDataFrontend | null>> {
  if (!featureToggle.service.fetchWonen.isEnabled) {
    return apiPostponeResult(null);
  }

  const service =
    authProfileAndToken.profile.profileType === 'private'
      ? fetchPrivate
      : fetchCommercial;

  const bagResponse = await service(authProfileAndToken);

  if (bagResponse.status === 'ERROR') {
    return bagResponse;
  }
  // We only support fetching VVE data for users with at least one valid BAG location, as the VVE data is linked to a BAG verblijfsobjectIdentificatie.
  if (!bagResponse.content?.length) {
    return apiSuccessResult(null);
  }

  const bagLocations: BAGLocation[] = bagResponse.content ?? [];
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
