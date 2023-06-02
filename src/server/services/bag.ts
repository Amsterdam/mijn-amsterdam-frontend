import { LatLngLiteral } from 'leaflet';
import { apiErrorResult } from '../../universal/helpers';
import {
  getBagResult,
  getBagSearchAddress,
  getLatLonByAddress,
} from '../../universal/helpers/bag';
import { Adres } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';

export interface BAGData {
  latlng: LatLngLiteral | null;
  address?: Adres | null;
  bagNummeraanduidingId?: string | null;
}

export async function fetchBAG(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  BRPaddress: Adres | null
) {
  if (!BRPaddress) {
    return apiErrorResult('Could not query BAG, no address supplied.', null);
  }

  const searchAddress = getBagSearchAddress(BRPaddress);

  if (!searchAddress) {
    return apiErrorResult(`Kon geen correct zoek adres opmaken.`, null);
  }

  const params = { q: searchAddress, features: 2 }; // features=2 is een Feature flag zodat ook locaties in Weesp worden weergegeven.
  const config = getApiConfig('BAG', {
    params,
    transformResponse: (responseData) => {
      const isWeesp = BRPaddress.woonplaatsNaam === 'Weesp';

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
        address: BRPaddress,
        bagNummeraanduidingId: bagResult?.landelijk_id ?? null,
      };
    },
  });
  return requestData<BAGData>(config, requestID);
}
