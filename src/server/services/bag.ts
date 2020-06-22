import { getBagSearchAddress, toLatLng } from '../../universal/helpers';
import { Adres } from '../../universal/types';
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
  samlToken: string,
  address: Adres
) {
  const params = { q: getBagSearchAddress(address) };

  return requestData<BAGData>(
    getApiConfig('BAG', {
      params,
      transformResponse: formatBAGData,
    }),
    sessionID,
    samlToken
  );
}
