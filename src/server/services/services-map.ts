import { apiSuccesResult } from '../../universal/helpers';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
  LOCATION_ZOOM,
  LAYERS_CONFIG,
  DEFAULT_ZOOM,
} from '../../universal/config';
import { fetchHOME } from './home';

const MAP_URL =
  'https://data.amsterdam.nl/data/?modus=kaart&achtergrond=topo_rd_zw&embed=true';

export async function loadServicesMap(sessionID: SessionID, samlToken: string) {
  const HOME = await fetchHOME(sessionID, samlToken);

  let lat = DEFAULT_LAT;
  let lng = DEFAULT_LNG;

  if (HOME.status === 'OK' && HOME.content?.latlng) {
    lat = HOME.content.latlng.lat;
    lng = HOME.content.latlng.lng;
  }

  const embed = {
    advanced: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${DEFAULT_ZOOM}&marker=${lat}%2C${lng}&marker-icon=home&${LAYERS_CONFIG}&legenda=true`,
    simple: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lng}&marker-icon=home`,
  };

  return { BUURT: apiSuccesResult({ embed }) };
}
