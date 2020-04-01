import { AxiosResponse } from 'axios';
import { ApiUrls } from '../config/app';
import { requestSourceData } from '../helpers/requestSourceData';
import { Adres, getFullAddress } from './brp';

export interface BAGSourceData {
  results: Array<{ [key: string]: any; centroid: Centroid }>;
}

export interface BAGData {
  latlng: LatLngObject | null;
}

export function formatBAGData(
  sourceData: AxiosResponse<BAGSourceData>
): BAGData {
  const centroid = !!sourceData.data?.results.length
    ? sourceData.data.results[0].centroid
    : null;
  return { latlng: centroid ? { lat: centroid[1], lng: centroid[0] } : null };
}

export function fetch(address: Adres) {
  const params = { q: getFullAddress(address) };
  console.log('address', params);
  return requestSourceData<BAGSourceData>({
    url: ApiUrls.BAG,
    params,
  }).then(formatBAGData);
}
