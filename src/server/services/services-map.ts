import { apiSuccesResult } from '../../universal/helpers';
import { dataCache } from './sourceApiResponseCache';
import { fetchBAG } from './bag';
import {
  MAP_URL,
  DEFAULT_LAT,
  DEFAULT_LNG,
  LOCATION_ZOOM,
  LAYERS_CONFIG,
  ApiResult,
} from '../../universal/config';

export async function loadServicesMap(sessionID: SessionID) {
  const BAG: ApiResult<typeof fetchBAG> = await dataCache.get(sessionID, 'BAG');

  let lat = DEFAULT_LAT;
  let lng = DEFAULT_LNG;

  if (BAG.status === 'success') {
    lat = BAG.content.latlng!.lat;
    lng = BAG.content.latlng!.lat;
  }

  const embed = {
    advanced: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lng}&marker-icon=home&${LAYERS_CONFIG}&legenda=true`,
    simple: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lng}&marker-icon=home`,
  };

  return { BUURT: apiSuccesResult({ embed }) };
}
