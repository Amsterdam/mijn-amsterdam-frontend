import {
  CITY_LAYERS_CONFIG,
  CITY_ZOOM,
  DEFAULT_LAT,
  DEFAULT_LNG,
  HOOD_LAYERS_CONFIG,
  HOOD_ZOOM,
  LOCATION_ZOOM,
} from '../../universal/config';
import { apiSuccesResult } from '../../universal/helpers';
import { fetchHOME } from './home';

const MAP_URL =
  'https://data.amsterdam.nl/data/?modus=kaart&achtergrond=topo_rd_zw&embed=true';

export function getEmbedUrl(latlng: LatLngObject | null) {
  let lat = DEFAULT_LAT;
  let lng = DEFAULT_LNG;

  let embed = {
    advanced: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${CITY_ZOOM}&${CITY_LAYERS_CONFIG}&legenda=true`,
    simple: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${CITY_ZOOM}`,
  };

  if (latlng && latlng.lat && latlng.lng) {
    lat = latlng.lat;
    lng = latlng.lng;

    embed = {
      advanced: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${HOOD_ZOOM}&marker=${lat}%2C${lng}&${HOOD_LAYERS_CONFIG}&legenda=true&marker-icon=home`,
      simple: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lng}&marker-icon=home`,
    };
  }

  return embed;
}

export async function fetchBUURT(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  profileType: ProfileType
) {
  const HOME = await fetchHOME(
    sessionID,
    passthroughRequestHeaders,
    profileType
  );
  return apiSuccesResult({
    embed: getEmbedUrl(HOME.content?.latlng || null),
  });
}
