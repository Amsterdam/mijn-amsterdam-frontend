import { Adres, getFullAddress } from './brp';

import { ApiUrls } from '../../universal/config';
import { AxiosResponse } from 'axios';
import { requestSourceData } from '../../universal/helpers';

export interface BAGSourceData {
  results: Array<{ [key: string]: any; centroid: Centroid }>;
}

export interface BAGData {
  latlng: LatLngObject | null;
}

export function formatBAGData(response: AxiosResponse<BAGSourceData>): BAGData {
  const centroid = !!response.data?.results.length
    ? response.data.results[0].centroid
    : null;
  return { latlng: centroid ? { lat: centroid[1], lng: centroid[0] } : null };
}

export function fetchBAG(address: Adres) {
  const params = { q: getFullAddress(address) };

  return requestSourceData<BAGSourceData>({
    url: ApiUrls.BAG,
    params,
  }).then(formatBAGData);
}
