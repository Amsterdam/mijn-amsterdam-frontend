import {
  getBagSearchAddress,
  toLatLng,
  apiErrorResult,
} from '../../universal/helpers';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';
import { Adres } from '../../universal/types';

export interface BAGSourceData {
  results: Array<{ [key: string]: any; centroid: Centroid }>;
}

export interface BAGData {
  latlng: LatLngObject | null;
  address?: Adres;
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
      transformResponse: responseData => formatBAGData(responseData, address),
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
