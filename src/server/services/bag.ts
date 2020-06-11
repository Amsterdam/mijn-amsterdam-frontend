import { Adres, getFullAddress } from './brp';

import { ApiUrls } from '../../universal/config';

import { requestData } from '../helpers';
import { toLatLng } from '../../universal/helpers/geo';

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

export function fetchBAG(address: Adres) {
  const params = { q: getFullAddress(address) };

  return requestData<BAGData>({
    url: ApiUrls.BAG,
    params,
    transformResponse: formatBAGData,
  });
}
