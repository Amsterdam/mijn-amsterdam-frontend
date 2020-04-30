import { getBagSearchAddress, toLatLng } from '../../universal/helpers';
import { Adres } from '../../universal/types';
import { requestData } from '../helpers';
import { ApiUrls, getApiConfigValue } from '../config';

export interface BAGSourceData {
  results: Array<{ [key: string]: any; centroid: Centroid }>;
}

export interface BAGData {
  latlng: LatLngObject | null;
}

export function formatBAGData(responseData: BAGSourceData): BAGData {
  const centroid = !!responseData?.results.length
    ? responseData.results[0].centroid
    : null;
  return {
    latlng: centroid ? toLatLng(centroid) : null,
  };
}

export function fetchBAG(sessionID: SessionID, address: Adres) {
  const params = { q: getBagSearchAddress(address) };

  return requestData<BAGData>(
    {
      url: ApiUrls.BAG,
      params,
      transformResponse: formatBAGData,
    },
    sessionID,
    getApiConfigValue('BAG', 'postponeFetch', false)
  );
}
