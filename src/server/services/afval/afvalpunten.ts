import { LatLngLiteral } from 'leaflet';

import afvalpunten from './afvalpunten-data.json';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { getApproximateDistance } from '../../../universal/helpers/geo';
import { sortByNumber } from '../../../universal/helpers/utils';
import type {
  AfvalPuntenData,
  AfvalCenter,
} from '../../../universal/types/afval';

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
  const responseData: { centers: AfvalCenter[] } = { centers };
  return apiSuccessResult(responseData);
}
