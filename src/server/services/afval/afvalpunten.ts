import { LatLngLiteral } from 'leaflet';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { getApproximateDistance } from '../../../universal/helpers/geo';
import { sortByNumber } from '../../../universal/helpers/utils';
import type {
  AfvalPuntenData,
  GarbageCenter,
} from '../../../universal/types/afval';
import afvalpunten from './afvalpunten-data.json';

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
    .sort(sortByNumber('distance', 'asc'));
}

export function fetchAfvalpuntenByLatLng(latlng: LatLngLiteral | null) {
  const centers = addApproximateDistance(latlng, afvalpunten);
  const responseData: { centers: GarbageCenter[] } = { centers };
  return apiSuccessResult(responseData);
}
