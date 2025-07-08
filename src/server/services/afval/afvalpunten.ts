import { LatLngLiteral } from 'leaflet';

import type { AfvalPuntenData, AfvalCenter } from './afval.types.ts';
import afvalpunten from './afvalpunten-data.json' with { type: 'json' };
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { getApproximateDistance } from '../../../universal/helpers/geo.ts';
import { sortByNumber } from '../../../universal/helpers/utils.ts';

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
