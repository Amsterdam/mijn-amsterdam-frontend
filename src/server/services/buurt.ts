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
import proj4 from 'proj4';

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

const projDefinition = `+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.4171,50.3319,465.5524,-0.398957,0.343988,-1.87740,4.0725 +units=m +no_defs'`;
const proj4RD = proj4('WGS84', projDefinition);

export async function loadServicesMapDatasets() {
  // sessionID: SessionID,
  // passthroughRequestHeaders: Record<string, string>
  const datasets = await Promise.all([
    Promise.resolve(
      require('../mock-data/json/map-datasets/afvalcontainers.json')
    ).then((response) => {
      const datasets: Record<string, Array<[number, number]>> = {};
      for (const feature of response.features) {
        const wasteName = feature.properties.waste_name.toLowerCase();
        // const properties = {
        //   title: `${item.properties.waste_name} container`,
        //   description: `${item.properties.text || 'geen besc.'}
        //   id: ${item.properties.id_number}
        //   `,
        //   dataset: [
        //     'afvalcontainers',
        //     item.properties.waste_name.toLowerCase(),
        //   ],
        // };

        // return {
        //   type: 'Feature',
        //   properties,
        //   geometry: item.geometry,
        // };
        if (!datasets[wasteName]) {
          datasets[wasteName] = [];
        }
        // const [lng, lat] = feature.geometry.coordinates;
        datasets[wasteName].push(feature.geometry.coordinates);
      }
      return {
        id: 'afvalcontainers',
        datasets,
      };
    }),
    Promise.resolve(
      require('../mock-data/json/map-datasets/evenementen.json')
    ).then((response) => {
      const evenementen = response.features.map((item: any) => {
        const coordinates = proj4RD.inverse(item.geometry.coordinates);
        // const properties = {
        //   title: item.properties.titel,
        //   description: item.properties.omschrijving,
        //   dataset: ['evenementen', 'evenementen'],
        // };
        // const geometry = {
        //   type: 'Point',
        //   coordinates,
        // };
        // return {
        //   type: 'Feature',
        //   properties,
        //   geometry,
        // };
        // const [lng, lat] = coordinates;
        return coordinates;
      });
      return {
        id: 'evenementen',
        datasets: {
          evenementen,
        },
      };
    }),
    Promise.resolve(
      require('../mock-data/json/map-datasets/bekendmakingen.json')
    ).then((response) => {
      const datasets: Record<string, Array<[number, number]>> = {};
      for (const feature of response.features) {
        const coordinates = proj4RD.inverse(feature.geometry.coordinates);
        // const properties = {
        //   dataset: ['bekendmakingen', item.properties.onderwerp],
        //   title: item.properties.onderwerp,
        //   date: item.properties.datum,
        //   description: item.properties.titel,
        //   url: item.url,
        // };
        // const geometry = {
        //   type: 'Point',
        //   coordinates,
        // };
        if (!datasets[feature.properties.onderwerp]) {
          datasets[feature.properties.onderwerp] = [];
        }
        // const [lng, lat] = coordinates;
        datasets[feature.properties.onderwerp].push(coordinates);
        // return {
        //   type: 'Feature',
        //   properties,
        //   geometry,
        // };
      }
      // console.log(
      //   Array.from(new Set(features.map(item => item.properties.dataset[1])))
      // );
      return {
        id: 'bekendmakingen',
        datasets,
      };
    }),
  ]);

  return apiSuccesResult(datasets);
}
