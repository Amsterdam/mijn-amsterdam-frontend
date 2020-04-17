import { apiSuccesResult } from '../../universal/helpers';
import {
  MAP_URL,
  DEFAULT_LAT,
  DEFAULT_LNG,
  LOCATION_ZOOM,
  LAYERS_CONFIG,
} from '../../universal/config';
import { fetchHOME } from './home';

export async function loadServicesMap(sessionID: SessionID) {
  const HOME = await fetchHOME(sessionID);

  let lat = DEFAULT_LAT;
  let lng = DEFAULT_LNG;

  if (HOME.status === 'OK') {
    lat = HOME.content.latlng!.lat;
    lng = HOME.content.latlng!.lat;
  }

  const embed = {
    advanced: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lng}&marker-icon=home&${LAYERS_CONFIG}&legenda=true`,
    simple: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lng}&marker-icon=home`,
  };

  return { BUURT: apiSuccesResult({ embed }) };
}
