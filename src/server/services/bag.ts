import { LatLngLiteral, LatLngTuple } from 'leaflet';
import {
  apiErrorResult,
  getBagSearchAddress,
  toLatLng,
} from '../../universal/helpers';
import { Adres } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

export interface BAGSourceData {
  results: Array<{ [key: string]: any; centroid: LatLngTuple }>;
}

export interface BAGData {
  latlng: LatLngLiteral | null;
  address?: Adres | null;
}

export function formatBAGData(
  responseData: BAGSourceData,
  address?: Adres
): BAGData {
  const centroid = !!responseData?.results?.length
    ? responseData.results[0].centroid
    : null;
  return {
    latlng: centroid ? toLatLng(centroid) : null,
    address,
  };
}

export async function fetchBAG(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  address: Adres
) {
  if (!address) {
    return apiErrorResult('Could not query BAG, no address supplied.', null);
  }

  const params = { q: getBagSearchAddress(address) };

  return requestData<BAGData>(
    getApiConfig('BAG', {
      params,
      transformResponse: (responseData) => formatBAGData(responseData, address),
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
