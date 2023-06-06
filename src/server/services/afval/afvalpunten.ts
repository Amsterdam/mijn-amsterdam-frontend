import { LatLngLiteral } from 'leaflet';
import memoryCache from 'memory-cache';
import {
  apiSuccessResult,
  ApiSuccessResponse,
  getApproximateDistance,
  apiErrorResult,
} from '../../../universal/helpers';
import { sortAlpha } from '../../../universal/helpers/utils';
import { AfvalPuntenData, GarbageCenter } from '../../../universal/types/afval';
import FileCache from '../../helpers/file-cache';

export const cache = new memoryCache.Cache<string, any>();

interface AfvalpuntenResponseData {
  centers: GarbageCenter[];
  datePublished: string;
}

const fileCache = new FileCache({
  name: 'afvalpunten',
  cacheTimeMinutes: -1,
});

function addApproximateDistance(
  latlng: LatLngLiteral | null,
  centers: AfvalPuntenData
) {
  return centers
    .map((garbageCenter) => {
      return Object.assign(garbageCenter, {
        distance: latlng
          ? getApproximateDistance(latlng, garbageCenter.latlng)
          : 0,
      });
    })
    .sort(sortAlpha('distance'));
}

export async function fetchAfvalpunten(latlng: LatLngLiteral | null) {
  const cachedFileContents: AfvalpuntenResponseData | undefined =
    fileCache.getKey('responseData');

  if (cachedFileContents) {
    const responseData: AfvalpuntenResponseData = {
      ...cachedFileContents,
      centers: addApproximateDistance(latlng, cachedFileContents.centers),
    };
    return apiSuccessResult(responseData);
  }

  return apiErrorResult(
    'Could not retrieve Afvalpunten from file cache.',
    null
  );
}
