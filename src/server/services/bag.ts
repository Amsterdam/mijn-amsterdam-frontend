import {
  getBagSearchAddress,
  toLatLng,
  apiErrorResult,
} from '../../universal/helpers';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

export interface BAGSourceData {
  results: Array<{ [key: string]: any; centroid: Centroid }>;
}

export interface BAGData {
  latlng: LatLngObject | null;
}

export function formatBAGData(responseData: BAGSourceData): BAGData {
  const centroid = !!responseData?.results?.length
    ? responseData.results[0].centroid
    : null;
  return {
    latlng: centroid ? toLatLng(centroid) : null,
  };
}

export function fetchBAG(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  address: { straatnaam: string | null; huisnummer: string | null }
) {
  if (!address) {
    return apiErrorResult('Could not query BAG, no address supplied.', null);
  }

  const params = { q: getBagSearchAddress(address) };

  return requestData<BAGData>(
    getApiConfig('BAG', {
      params,
      transformResponse: formatBAGData,
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
