import { LatLngLiteral } from 'leaflet';

import { apiErrorResult } from '../../universal/helpers/api';
import {
  getBagResult,
  getBagSearchAddress,
  getLatLonByAddress,
} from '../../universal/helpers/bag';
import { Adres } from '../../universal/types';
import { getApiConfig } from '../helpers/source-api-helpers';
import { requestData } from '../helpers/source-api-request';

export interface BAGData {
  latlng: LatLngLiteral | null;
  address?: Adres | null;
  bagNummeraanduidingId?: string | null;
  profileType: ProfileType;
}

export async function fetchBAG(
  requestID: RequestID,
  sourceAddress: Adres | null
) {
  if (!sourceAddress) {
    return apiErrorResult('Could not query BAG, no address supplied.', null);
  }

  const searchAddress = getBagSearchAddress(sourceAddress);

  if (!searchAddress) {
    return apiErrorResult(`Kon geen correct zoek adres opmaken.`, null);
  }

  const params = { q: searchAddress, features: 2 }; // features=2 is een Feature flag zodat ook locaties in Weesp worden weergegeven.
  const config = getApiConfig('BAG', {
    params,
    cacheKey: `${requestID}-${searchAddress}`,
    transformResponse: (responseData) => {
      const isWeesp = sourceAddress.woonplaatsNaam === 'Weesp';

      const latlng = getLatLonByAddress(
        responseData?.results,
        searchAddress,
        isWeesp
      );

      const bagResult = getBagResult(
        responseData?.results,
        searchAddress,
        isWeesp
      );

      return {
        latlng,
        address: sourceAddress,
        bagNummeraanduidingId: bagResult?.landelijk_id ?? null,
      };
    },
  });
  return requestData<BAGData>(config, requestID);
}
