import { LatLngLiteral } from 'leaflet';
import { apiErrorResult } from '../../universal/helpers';
import {
  getBagSearchAddress,
  getLatLonByAddress,
} from '../../universal/helpers/bag';
import { Adres } from '../../universal/types';
import { BAGSourceData } from '../../universal/types/bag';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { AuthProfileAndToken } from '../helpers/app';

export interface BAGData {
  latlng: LatLngLiteral | null;
  address?: Adres | null;
}

export function formatBAGData(
  responseData: BAGSourceData,
  address: Adres
): BAGData {
  const searchAddress = getBagSearchAddress(address);
  const isWeesp = address.woonplaatsNaam === 'Weesp';
  const latlng = getLatLonByAddress(
    responseData?.results,
    searchAddress,
    isWeesp
  );
  return {
    latlng,
    address,
  };
}

export async function fetchBAG(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  address: Adres | null
) {
  if (!address) {
    return apiErrorResult('Could not query BAG, no address supplied.', null);
  }

  const searchAddress = getBagSearchAddress(address);
  const params = { q: searchAddress, features: 2 }; // features=2 is een Feature flag zodat ook locaties in Weesp worden weergegeven.

  return requestData<BAGData>(
    getApiConfig('BAG', {
      params,
      transformResponse: (responseData) => formatBAGData(responseData, address),
    }),
    requestID,
    authProfileAndToken
  );
}
