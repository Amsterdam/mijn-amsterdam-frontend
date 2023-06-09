import { LatLngLiteral } from 'leaflet';
import {
  apiSuccessResult,
  getApproximateDistance,
  sortAlpha,
} from '../../../universal/helpers';
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
    .sort(sortAlpha('distance'));
}

export function fetchAfvalpunten(latlng: LatLngLiteral | null) {
  const centers = addApproximateDistance(latlng, afvalpunten);
  const responseData: { centers: GarbageCenter[] } = { centers };
  return apiSuccessResult(responseData);
}
